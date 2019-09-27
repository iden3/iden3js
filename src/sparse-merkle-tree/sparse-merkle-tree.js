import * as helpers from './sparse-merkle-tree-utils';
import { Entry } from '../claim/claim';

const snarkjs = require('snarkjs');
const utils = require('../utils');
const CONSTANTS = require('../constants');
const { poseidon } = require('../crypto/crypto.js');

const { bigInt } = snarkjs;

const emptyNodeValue = Buffer.alloc(32);

const errorEntryNotFound = 'Entry not found';
const errorFoundDiffEntry = 'Found a different entry in the hi path';

/**
* Retrieve node value from merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {String} prefix - Prefix added to the key
* @returns {Object} - Object representation of node value
*/
function getNodeValue(db, key, prefix) {
  const keyHex = utils.bytesToHex(key);
  const valueHex = db.get(prefix + keyHex);
  if (valueHex === null) { return emptyNodeValue; }
  return utils.bufferToBuffArray(utils.hexToBytes(valueHex));
}

/**
* Set node value to the merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {Object} value - Object representation of node value (Array of buffers)
* @param {String} prefix - Prefix added to the key
*/
function setNodeValue(db, key, value, prefix) {
  const keyHex = utils.bytesToHex(key);
  const valueHex = utils.bytesToHex(utils.buffArrayToBuffer(value));
  db.insert(prefix + keyHex, valueHex);
}

/**
* Retrieve node hash as Hash[1, hi, hv] in buffer object
* @param {bigInt} hi - Hash index of the claim
* @param {bigInt} hv - Hash value of the claim
* @returns {Buffer} - Key node value
*/
function getHashFinalNode(hi, hv) {
  // const hashArray = [hi, hv];
  // const hashKey = mimc7.multiHash(hashArray, bigInt(1));
  // const hashArray = [bigInt(1), hi, hv];
  const hashArray = [hi, hv, bigInt(1)];
  const hashKey = poseidon.multiHash(hashArray);
  return utils.bigIntToBufferBE(hashKey);
}

class SparseMerkleTree {
  /**
  * Initiate sparse merkle tree
  * @param {Object} db - Database
  * @param {String} idAddr - adress of the identity
  * @param {Number} maxLevels - max levels of the merkle tree
  */
  constructor(db, idAddr, maxLevels) {
    this.db = db;
    this.prefix = CONSTANTS.MTPREFIX + idAddr;
    this.root = emptyNodeValue;
    this.maxLevels = maxLevels;
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
  * @param {Entry} claim - Claim data object to be added to the merkle tree
  */
  addEntry(entry) {
    const hi = entry.hiBigInt();
    const hv = entry.hvBigInt();
    const hiBinary = helpers.getIndexArray(hi);

    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    const arraySiblings = [];
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hiBinary.length - 1)) ? 0 : hiBinary[claimIndex];
      arraySiblings.push(bitLeaf ? nodeValue[0] : nodeValue[1]);
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      claimIndex += 1;
    }

    if (nodeValue === emptyNodeValue) {
      let nextHash = getHashFinalNode(hi, hv);
      setNodeValue(this.db, nextHash, entry.elements, this.prefix);
      let concat = 0;
      const level = arraySiblings.length - 1;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hiBinary.length - 1)) ? 0 : hiBinary[i];
        const siblingTmp = arraySiblings[i];
        concat = bitLeaf ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
        // nextHash = utils.bigIntToBufferBE(mimc7.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
        nextHash = utils.bigIntToBufferBE(poseidon.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
        setNodeValue(this.db, nextHash, concat, this.prefix);
      }
      this.root = nextHash;
      return;
    }

    if (nodeValue.length === 4) {
      // get current node value and its hIndex
      const totalTmp = utils.getArrayBigIntFromBuffArrayBE(nodeValue);
      let hiTmp = totalTmp.slice(2);
      // hiTmp = helpers.getIndexArray(mimc7.multiHash(hiTmp));
      hiTmp = helpers.getIndexArray(poseidon.multiHash(hiTmp));
      // compare position index until find a split
      let compare = false;
      let pos = claimIndex;
      while (!compare) {
        const bitLeaf = (pos > (hiBinary.length - 1)) ? 0 : hiBinary[pos];
        const bitLeafTmp = (pos > (hiTmp.length - 1)) ? 0 : hiTmp[pos];
        compare = bitLeaf ^ bitLeafTmp;
        if (!compare) {
          arraySiblings.push(emptyNodeValue);
        }
        pos += 1;
        if (pos > this.maxLevels) {
          // exit function in case that the maxLevels is reached
          throw new Error('maxLevels reached');
        }
      }
      arraySiblings.push(key);
      // Write current branch with new claim added
      const newHash = getHashFinalNode(hi, hv);
      setNodeValue(this.db, newHash, entry.elements, this.prefix);
      // Recalculate nodes until the root
      let concat = 0;
      const level = arraySiblings.length - 1;
      let nextHash = newHash;
      for (let i = level; i >= 0; i--) {
        const bitLeaf = (i > (hiBinary.length - 1)) ? 0 : hiBinary[i];
        const siblingTmp = arraySiblings[i];
        concat = bitLeaf ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
        // nextHash = utils.bigIntToBufferBE(mimc7.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
        nextHash = utils.bigIntToBufferBE(poseidon.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
        setNodeValue(this.db, nextHash, concat, this.prefix);
      }
      this.root = nextHash;
    }
  }

  /**
  * Retrieve data for a given leaf position
  * @param {bigInt} hi - Hash of the index leaf generator
  * @returns {Entry} - Data of the leaf given as a claim object
  */
  getEntryByHi(hi) {
    // Compute hi of the claim
    const hiBinary = helpers.getIndexArray(hi);
    // Find last node written
    let key = this.root;
    let nodeValue = getNodeValue(this.db, key, this.prefix);
    let claimIndex = 0;
    while (nodeValue.length === 2) {
      const bitLeaf = (claimIndex > (hiBinary.length - 1)) ? 0 : hiBinary[claimIndex];
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      if (nodeValue === emptyNodeValue) {
        throw new Error(errorEntryNotFound);
      }
      claimIndex += 1;
    }
    const entry = new Entry(nodeValue[0], nodeValue[1], nodeValue[2], nodeValue[3]);
    if (entry.hiBigInt() !== hi) {
      throw new Error(errorFoundDiffEntry);
    }
    return entry;
  }

  /**
  * Generates the merkle proof of the leaf at a given position
  * @param {bigInt} hi - Hash of the index leaf generator
  * @returns {Buffer} - Data containing merkle tree proof of existence or non-existence
  */
  generateProof(hi) {
    // Compute hi of the claim
    const hiBinary = helpers.getIndexArray(hi);
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
      const bitLeaf = (claimIndex > (hiBinary.length - 1)) ? 0 : hiBinary[claimIndex];
      nextSibling = bitLeaf ? nodeValue[0] : nodeValue[1];
      key = bitLeaf ? nodeValue[1] : nodeValue[0];
      nodeValue = getNodeValue(this.db, key, this.prefix);
      if (Buffer.compare(nextSibling, emptyNodeValue) !== 0) {
        arraySiblings.push(nextSibling);
        numByte = Math.floor((claimIndex) / 8);
        indicatorSibling[startIndex - numByte] = helpers.setBit(indicatorSibling[startIndex - numByte], claimIndex % 8);
      }
      claimIndex += 1;
    }

    let checkIndex = false;
    let exist = 0x01;
    let totalTmp;
    // Claim search could be there or not
    if (nodeValue.length === 4) {
      // set exist to 0
      exist = 0x00;
      // get current node value and its hIndex
      totalTmp = new Entry(nodeValue[0], nodeValue[1], nodeValue[2], nodeValue[3]);
      const hiTmp = helpers.getIndexArray(totalTmp.hiBigInt());
      // Check input index and node index
      let pos = claimIndex;
      while (!checkIndex && !((pos > hiBinary.length - 1) && (pos > hiTmp.length - 1))) {
        const bitLeaf = (pos > (hiBinary.length - 1)) ? 0 : hiBinary[pos];
        const bitLeafTmp = (pos > (hiTmp.length - 1)) ? 0 : hiTmp[pos];
        checkIndex = bitLeaf ^ bitLeafTmp;
        pos += 1;
      }
    }

    // Generate proof structure
    // Set bit non-existence empty or non-existence diff
    if (checkIndex) {
      exist = 0x03;
    }

    const flagExist = Buffer.alloc(1);
    flagExist.writeUInt8(exist);
    const flagLevel = Buffer.alloc(1);
    flagLevel.writeUInt8(claimIndex);
    let buffTmp = Buffer.concat([flagExist, flagLevel, indicatorSibling]);
    for (let i = 0; i < arraySiblings.length; i++) {
      buffTmp = Buffer.concat([buffTmp, arraySiblings[i]]);
    }
    if (checkIndex) {
      buffTmp = Buffer.concat([buffTmp, totalTmp.hi(), totalTmp.hv()]);
    }
    return buffTmp;
  }
}

/**
* Verifies the merkle proof
* @param  {String} rootHex - Hexadecimal string of the merkle tree root
* @param  {String} proofHex - Hexadecimal string of the merkle tree proof
* @param  {String} hiHex - Hexadecimal string of the leaf index hash
* @param  {String} hvHex - Hexadecimal string of the leaf value hash
* @returns  {Bool} - Result of the merkle tree verification
*/
function checkProof(rootHex, proofHex, hiHex, hvHex) {
  const root = utils.hexToBytes(rootHex);
  const proofBuff = helpers.parseProof(proofHex);
  const hi = utils.bufferToBigIntBE(utils.hexToBytes(hiHex));
  const hv = utils.bufferToBigIntBE(utils.hexToBytes(hvHex));
  const hvBuff = getHashFinalNode(hi, hv);
  const hiBinary = helpers.getIndexArray(hi);
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
    const hiTmp = utils.bufferToBigIntBE(proofBuff.metaData.slice(0, 32));
    const hvTmp = utils.bufferToBigIntBE(proofBuff.metaData.slice(32, proofBuff.metaData.length));
    const hiTmpBinary = helpers.getIndexArray(hiTmp);
    while (!exist && !((pos > hiBinary.length - 1) && (pos > hiTmpBinary.length - 1))) {
      const bitLeaf = (pos > (hiBinary.length - 1)) ? 0 : hiBinary[pos];
      const bitLeafTmp = (pos > (hiTmpBinary.length - 1)) ? 0 : hiTmpBinary[pos];
      exist = bitLeaf ^ bitLeafTmp;
      pos += 1;
    }
    if (!exist) {
      return false;
    }
    newHash = getHashFinalNode(hiTmp, hvTmp);
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
  let nextHash = flagNonExistence ? newHash : hvBuff;
  for (let i = arrayFullSiblings.length - 1; i >= 0; i--) {
    const siblingTmp = arrayFullSiblings[i];
    concat = hiBinary[i] ? [siblingTmp, nextHash] : [nextHash, siblingTmp];
    // nextHash = utils.bigIntToBufferBE(mimc7.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
    nextHash = utils.bigIntToBufferBE(poseidon.multiHash(utils.getArrayBigIntFromBuffArrayBE(concat)));
  }
  return Buffer.compare(nextHash, root) === 0;
}

module.exports = {
  checkProof,
  SparseMerkleTree,
  emptyNodeValue,
};
