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


function getHashFinalNode(hi, ht) {
  const hashArray = [bigInt(1), hi, ht];
  const hashKey = mimc7.smtHash(hashArray);
  return helpers.bigIntToBuffer(hashKey);
}

function getHiHt(claim) {
  const totalHash = [];
  const indexGen = claim.slice(2);
  const middleGen = claim.slice(0, 2);
  const hi = mimc7.smtHash(indexGen);
  const hv = mimc7.smtHash(middleGen);
  totalHash.push(hv);
  totalHash.push(hi);
  return [hi, mimc7.smtHash(totalHash)];
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
    const currentClaim = claim;
    const hashes = getHiHt(claim);
    const hi = hashes[0];
    const ht = hashes[1];
    const hiBinay = helpers.getIndexArray(hi);

    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    const arraySiblings = [];
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hiBinay.length - 1)) ? 0 : hiBinay[claimIndex];
      arraySiblings.push(bitLeaf ? nodeValue[0] : nodeValue[1]);
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      claimIndex += 1;
    }

    if (nodeValue === emptyNodeValue) {
      let nextHash = getHashFinalNode(hi, ht);
      setNodeValue(this.db, nextHash, helpers.getArrayBuffFromArrayBigInt(currentClaim), this.prefix);
      let concat = 0;
      const level = arraySiblings.length - 1;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hiBinay.length - 1)) ? 0 : hiBinay[i];
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
      let hiTmp = totalTmp.slice(2);
      hiTmp = helpers.getIndexArray(mimc7.smtHash(hiTmp));
      // compare position index until find a split
      let compare = false;
      let pos = claimIndex;
      while (!compare) {
        const bitLeaf = (pos > (hiBinay.length - 1)) ? 0 : hiBinay[pos];
        const bitLeafTmp = (pos > (hiTmp.length - 1)) ? 0 : hiTmp[pos];
        compare = bitLeaf ^ bitLeafTmp;
        if (!compare) {
          arraySiblings.push(emptyNodeValue);
        }
        pos += 1;
      }
      arraySiblings.push(key);
      // Write current branch with new claim added
      const newHash = getHashFinalNode(hi, ht);
      setNodeValue(this.db, newHash, helpers.getArrayBuffFromArrayBigInt(currentClaim), this.prefix);
      // Recalculate nodes until the root
      let concat = 0;
      const level = arraySiblings.length - 1;
      let nextHash = newHash;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hiBinay.length - 1)) ? 0 : hiBinay[i];
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
    let claimIndex = 0;
    const arraySiblings = [];
    let nextSibling;
    const indicatorSibling = Buffer.alloc(30);
    const startIndex = indicatorSibling.length - 1;
    let numByte;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hi.length - 1)) ? 0 : hi[claimIndex];
      nextSibling = bitLeaf ? nodeValue[0] : nodeValue[1];
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      if (Buffer.compare(nextSibling, emptyNodeValue)) {
        arraySiblings.push(nextSibling);
        numByte = Math.floor((claimIndex) / 8);
        indicatorSibling[startIndex - numByte] = helpers.setBit(indicatorSibling[startIndex - numByte], claimIndex % 8);
      }
      claimIndex += 1;
    }

    let checkIndex = false;
    let exist = true;
    let totalTmp;
    // Claim search could be there or not
    if (nodeValue.length === 4) {
      // set exist to 0
      exist = false;
      // get current node value and its hIndex
      totalTmp = helpers.getArrayBigIntFromBuffArray(nodeValue);
      let hiTmp = totalTmp.slice(2);
      hiTmp = helpers.getIndexArray(mimc7.smtHash(hiTmp));
      // Check input index and node index
      let pos = claimIndex;
      while (!checkIndex && !((pos > hi.length - 1) && (pos > hiTmp.length - 1))) {
        const bitLeaf = (pos > (hi.length - 1)) ? 0 : hi[pos];
        const bitLeafTmp = (pos > (hiTmp.length - 1)) ? 0 : hiTmp[pos];
        checkIndex = bitLeaf ^ bitLeafTmp;
        pos += 1;
      }
    }

    // Generate proof structure
    // Set bit non-existence empty or non-existence diff
    if (checkIndex) {
      exist = helpers.setBit(exist, 0);
      exist = helpers.setBit(exist, 1);
    }

    const flagExist = Buffer.alloc(1);
    flagExist.writeUInt8(exist);
    const flagLevel = Buffer.alloc(1);
    flagLevel.writeUInt8(claimIndex);
    let concat = [flagExist, flagLevel, indicatorSibling];
    let buffTmp = Buffer.concat(concat);
    for (let i = 0; i < arraySiblings.length; i++) {
      concat = [buffTmp, arraySiblings[i]];
      buffTmp = Buffer.concat(concat);
    }
    if (checkIndex) {
      const hashes = getHiHt(totalTmp);
      const hiFinal = helpers.bigIntToBuffer(hashes[0]);
      const htFinal = helpers.bigIntToBuffer(hashes[1]);
      buffTmp = Buffer.concat([buffTmp, hiFinal, htFinal]);
    }
    return buffTmp;
  }
}

/**
* Verifies the merkle proof
* @param  {String} rootHex - Hexadecimal string of the merkle tree root
* @param  {String} proofHex - Hexadecimal string of the merkle tree proof
* @param  {String} hiHex - Hexadecimal string of the leaf hash index position
* @param  {String} htHex - Hexadecimal string of the leaf hash data
* @returns  {Bool} - Result of the merkle tree verification
*/

function checkProof(rootHex, proofHex, claim) {
  const root = utils.hexToBytes(rootHex);
  const proofBuff = helpers.parseProof(proofHex);
  const hashes = getHiHt(claim);
  const hi = hashes[0];
  const ht = hashes[1];
  const htBuff = getHashFinalNode(hi, ht);
  const hiBinay = helpers.getIndexArray(hi);
  const { siblings } = proofBuff;
  const arrayFullSiblings = [];
  const siblingsIndex = proofBuff.siblingsBitIndex;
  const flagNonExistence = helpers.getBit(proofBuff.flagExistence, 0);
  const flagNonDiff = helpers.getBit(proofBuff.flagExistence, 1);
  // First step --> if proof is non-existence-diff --> check nodekey is a final node
  let exist = false;
  let pos = 0;
  let newHash = emptyNodeValue;
  if (flagNonExistence && flagNonDiff) {
    const hiTmp = helpers.bufferToBigInt(proofBuff.metaData.slice(0, 32));
    const htTmp = helpers.bufferToBigInt(proofBuff.metaData.slice(32, proofBuff.metaData.length));
    const hiTmpBinary = helpers.getIndexArray(hiTmp);
    while (!exist && !((pos > hiBinay.length - 1) && (pos > hiTmpBinary.length - 1))) {
      const bitLeaf = (pos > (hiBinay.length - 1)) ? 0 : hiBinay[pos];
      const bitLeafTmp = (pos > (hiTmpBinary.length - 1)) ? 0 : hiTmpBinary[pos];
      exist = bitLeaf ^ bitLeafTmp;
      pos += 1;
    }
    if (!exist) {
      return false;
    }
    newHash = getHashFinalNode(hiTmp, htTmp);
  }

  // Second step --> Build structure to calculate root afterwards
  let posSiblings = 0;
  // Go through siblings until the root
  for (let i = 0; i < proofBuff.siblingsLength; i++) {
    const numByte = Math.floor(i / 8);
    const flagBit = helpers.getBit(siblingsIndex[siblingsIndex.length - 1 - numByte], i % 8);
    if (flagBit) {
      arrayFullSiblings.push(siblings.slice(posSiblings * 32, (posSiblings + 1) * 32));
      posSiblings += 1;
    } else {
      arrayFullSiblings.push(emptyNodeValue);
    }
  }

  // Third Step --> Calculate root
  let concat;
  let nextHash = flagNonExistence ? newHash : htBuff;
  for (let i = arrayFullSiblings.length - 1; i >= 0; i--) {
    const siblingTmp = arrayFullSiblings[i];
    concat = hiBinay[i] ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
    nextHash = helpers.bigIntToBuffer(mimc7.smtHash(helpers.getArrayBigIntFromBuffArray(concat)));
  }
  return Buffer.compare(nextHash, root) === 0;
}

module.exports = {
  checkProof,
  SparseMerkleTree,
  emptyNodeValue,
};
