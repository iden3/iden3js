const snarkjs = require('snarkjs');
const utils = require('../utils');
const helpers = require('./sparse-merkle-tree-utils');
const CONSTANTS = require('../constants');
const mimc7 = require('./mimc7');

const { bigInt } = snarkjs;

const emptyNodeValue = Buffer.alloc(32);

/**
* Retrieve node value from sparse merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {String} prefix - Prefix added to the key
* @returns {Buffer} - Value of the node
*/
function getNodeValue(db, key, prefix) {
  const keyHex = utils.bytesToHex(key);
  const valueHex = db.get(prefix + keyHex);
  if (valueHex === null) { return emptyNodeValue; }
  return helpers.bufferToNodeValue(utils.hexToBytes(valueHex));
}

/**
* Set node value to the merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {Buffer} value - Value of the node
* @param {String} prefix - Prefix added to the key
*/
function setNodeValue(db, key, value, prefix) {
  const keyHex = utils.bytesToHex(key);
  const valueHex = utils.bytesToHex(helpers.nodeValueToBuffer(value));
  db.insert(prefix + keyHex, valueHex);
}

class SparseMerkleTree {
  /**
  * Initiate sparse merkle tree
  * @param {Object} db - Database
  * @param {String} idAddr - adress of the identity
  */
  constructor(db, idAddr) {
    this.db = db;
    this.prefix = CONSTANTS.MTPREFIX + idAddr;
    this.root = emptyNodeValue;
  }

  /**
  * Get the root of the merkle tree
  * @returns {Buffer} - Root of the merkle tree
  */
  getRoot() {
    return this.root;
  }

  /**
  * Adds new data to a leaf
  * @param {Object} claim - Claim data object to be added to the merkle tree
  */
  addClaim(claim) {
    // total: array of 4 bigInt
    const total = claim.value;
    // index: array of 2 bigInt
    const indexHi = claim.index;
    // Compute hi of the claim
    const hi = helpers.getIndexArray(mimc7.smtHash(indexHi));
    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    const arraySiblings = [];
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hi.length - 1)) ? 0 : hi[claimIndex];
      arraySiblings.push(bitLeaf ? nodeValue[0] : nodeValue[1]);
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      claimIndex += 1;
    }

    if (nodeValue === emptyNodeValue) {
      let nextHash = helpers.bigIntToBuffer(mimc7.smtHash(total));
      setNodeValue(this.db, nextHash, helpers.getArrayBuffFromArrayBigInt(total), this.prefix);
      let concat = 0;
      const level = arraySiblings.length - 1;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hi.length - 1)) ? 0 : hi[i];
        const siblingTmp = arraySiblings[i];
        concat = bitLeaf ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
        nextHash = helpers.bigIntToBuffer(mimc7.smtHash(helpers.getArrayBigIntFromBuffArray(concat)));
        setNodeValue(this.db, nextHash, concat, this.prefix);
      }
      this.root = nextHash;
      return;
    }

    if (nodeValue.length === 4) {
      // get current node value and its hIndex
      const totalTmp = helpers.getArrayBigIntFromBuffArray(nodeValue);
      let hiTmp = totalTmp.slice(0, 2);
      hiTmp = helpers.getIndexArray(mimc7.smtHash(hiTmp));
      // compare position index until find a split
      let compare = false;
      let pos = claimIndex;
      while (!compare) {
        const bitLeaf = (pos > (hi.length - 1)) ? 0 : hi[pos];
        const bitLeafTmp = (pos > (hiTmp.length - 1)) ? 0 : hiTmp[pos];
        compare = bitLeaf ^ bitLeafTmp;
        if (!compare) {
          arraySiblings.push(emptyNodeValue);
        }
        pos += 1;
      }
      arraySiblings.push(key);
      // Write current branch with new claim added
      const newHash = helpers.bigIntToBuffer(mimc7.smtHash(total));
      setNodeValue(this.db, newHash, helpers.getArrayBuffFromArrayBigInt(total), this.prefix);
      // Recalculate nodes until the root
      let concat = 0;
      const level = arraySiblings.length - 1;
      let nextHash = newHash;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hi.length - 1)) ? 0 : hi[i];
        const siblingTmp = arraySiblings[i];
        concat = bitLeaf ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
        nextHash = helpers.bigIntToBuffer(mimc7.smtHash(helpers.getArrayBigIntFromBuffArray(concat)));
        setNodeValue(this.db, nextHash, concat, this.prefix);
      }
      this.root = nextHash;
    }
  }

  /**
  * Retrieve data for a given leaf position
  * @param {Uint8Array(32)} hi - Hash of the position of the leaf
  * @returns {Object} - Data of the leaf
  */
  getClaimByHi(indexHi) {
    // Compute hi of the claim
    const hi = helpers.getIndexArray(mimc7.smtHash(indexHi));
    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hi.length - 1)) ? 0 : hi[claimIndex];
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      claimIndex += 1;
    }
    return helpers.getArrayBigIntFromBuffArray(nodeValue);
  }

  /**
  * Generates the merkle proof of the leaf in the position hi
  * @param {Uint8Array(32)} hi - Hash of the position of the leaf
  * @returns {Object} - Data containing merkle tree proof of existence or non-existence
  */
  generateProof(indexHi) {
    // Compute hi of the claim
    const hi = helpers.getIndexArray(mimc7.smtHash(indexHi));
    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    const arraySiblings = [];
    let nextSibling;
    const indicatorSibling = Buffer.alloc(31);
    const startIndex = indicatorSibling.length - 1;
    let numByte;
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hi.length - 1)) ? 0 : hi[claimIndex];
      nextSibling = bitLeaf ? nodeValue[0] : nodeValue[1];
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      if (nextSibling !== emptyNodeValue) {
        arraySiblings.push(nextSibling);
        numByte = Math.floor((claimIndex) / 8);
        indicatorSibling[startIndex - numByte] = helpers.setBit(indicatorSibling[startIndex - numByte], claimIndex % 8);
      }
      claimIndex += 1;
    }
    // Generate proof structure
    const firstByte = Buffer.alloc(1);
    firstByte.writeUInt8(claimIndex);
    const concat = claimIndex ? [firstByte, indicatorSibling, arraySiblings] : [firstByte, indicatorSibling];
    return Buffer.concat(concat);
  }
}

module.exports = {
  SparseMerkleTree,
  emptyNodeValue,
};
