const utils = require('./utils');

const emptyNodeValue = Buffer.alloc(32);

/**
 * @param  {Buffer} b
 * @param  {Number} bit
 * @returns {Boolean}
 */
const getBit = function (b, bit) {
  const v = b.readUInt8(b.length - Math.floor(bit / 8) - 1);
  return ((v >> (bit % 8)) & 1) > 0;
};

/**
 * @param  {Number} numLevels
 * @param  {Buffer} hi
 * @returns {Array} array of booleans
 */
const getPath = function (numLevels, hi) {
  const path = [];
  for (let bitno = numLevels - 2; bitno >= 0; bitno--) {
    path.push(getBit(hi, bitno));
  }
  return path;
};

/**
 * @param  {String} rootHex
 * @param  {String} proofHex
 * @param  {String} hiHex
 * @param  {String} htHex
 * @param  {Number} numLevels
 * @returns  {Bool}
 */
const checkProof = function (rootHex, proofHex, hiHex, htHex, numLevels) {
  const r = utils.hexToBytes(rootHex);
  const proof = utils.hexToBytes(proofHex);
  const proofLength = proof.length;
  const hi = utils.hexToBytes(hiHex);
  const ht = utils.hexToBytes(htHex);
  const empties = proof.slice(0, 32);
  const emptiesLength = empties.length;
  const hashLength = emptyNodeValue.length;
  const siblings = [];
  const path = getPath(numLevels, hi);
  let nodeHash = ht;
  let siblingUsedPos = 0;

  for (let i = emptiesLength; i < proofLength; i += hashLength) {
    const siblingHash = proof.slice(i, i + hashLength);
    siblings.push(siblingHash);
  }

  for (let level = numLevels - 2; level >= 0; level--) {
    let sibling = [];
    if (getBit(empties, level)) {
      sibling = siblings[siblingUsedPos];
      siblingUsedPos += 1;
    } else {
      sibling = emptyNodeValue;
    }
    let node = {};
    if (path[numLevels - level - 2]) {
      const n = [sibling, nodeHash];
      node = Buffer.concat(n);
    } else {
      const n = [nodeHash, sibling];
      node = Buffer.concat(n);
    }
    if ((Buffer.compare(nodeHash, emptyNodeValue) === 0) && (Buffer.compare(sibling, emptyNodeValue) === 0)) {
      nodeHash = emptyNodeValue;
    } else {
      nodeHash = utils.hashBytes(node);
    }
  }

  return Buffer.compare(nodeHash, r) === 0;
};

module.exports = {
  emptyNodeValue,
  checkProof,
};
