const utils = require('./utils');

const EmptyNodeValue = new Buffer(32);

/**
 * @param  {Buffer} b
 * @param  {Number} bit
 * @returns {Boolean}
 */
var getBit = function(b, bit) {
  const v = b.readUInt8(b.length - Math.floor(bit / 8) - 1);
  return ((v >> (bit % 8)) & 1) > 0;
}

/**
 * @param  {Number} numLevels
 * @param  {Buffer} hi
 * @returns {Array} array of booleans
 */
var getPath = function(numLevels, hi) {
  let path = [];
  for (var bitno = numLevels - 2; bitno >= 0; bitno--) {
    path.push(getBit(hi, bitno));
  }
  return path;
}

/**
 * @param  {String} rootHex
 * @param  {String} proofHex
 * @param  {String} hiHex
 * @param  {String} htHex
 * @param  {Number} numLevels
 * @returns  {Bool}
 */
var checkProof = function(rootHex, proofHex, hiHex, htHex, numLevels) {
  let r = utils.hexToBytes(rootHex);
  let proof = utils.hexToBytes(proofHex);
  let hi = utils.hexToBytes(hiHex);
  let ht = utils.hexToBytes(htHex);

  let empties = proof.slice(0, 32);

  let hashLen = EmptyNodeValue.length;
  let siblings = [];
  for (var i = empties.length; i < proof.length; i += hashLen) {
    let siblingHash = proof.slice(i, i + hashLen);
    siblings.push(siblingHash);
  }
  let path = getPath(numLevels, hi);
  let nodeHash = ht;
  let siblingUsedPos = 0;
  for (var level = numLevels - 2; level >= 0; level--) {
    var sibling = [];
    if (getBit(empties, level)) {
      sibling = siblings[siblingUsedPos];
      siblingUsedPos++;
    } else {
      sibling = EmptyNodeValue;
    }
    let node = {};
    if (path[numLevels - level - 2]) {
      let n = [sibling, nodeHash];
      node = Buffer.concat(n);
    } else {
      let n = [nodeHash, sibling];
      node = Buffer.concat(n);
    }
    if ((Buffer.compare(nodeHash, EmptyNodeValue) === 0) && (Buffer.compare(sibling, EmptyNodeValue) === 0)) {
      nodeHash = EmptyNodeValue;
    } else {
      nodeHash = utils.hashBytes(node);
    }
  }
  return Buffer.compare(nodeHash, r) === 0;
}
module.exports = {
  checkProof
}
