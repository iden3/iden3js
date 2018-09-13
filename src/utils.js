const ethUtil = require('ethereumjs-util');

/**
 * Create a hash from a Buffer (a byte)
 *
 * @param {Buffer} b - A byte. It's a Buffer to do the hash
 * @returns {PromiseLike<ArrayBuffer>} - A hash created with keccak256
 */
var hashBytes = function(b) {
  var createKeccakHash = require('keccak');
  return createKeccakHash('keccak256').update(b).digest();
};

/**
 * Decode a Buffer to a string (UTF-16)
 * @param {Buffer} buff - Buffer to decode
 * @returns {String} - Decoded Buffer in UTF-16
 */
var bytesToHex = function(buff) {
  var hex = '0x' + buff.toString('hex');
  return hex;
};

/**
 * Allocates a new Buffer using a hexadecimal string sent
 * @param {String} hex - Hexadecimal string to parse to a Buffer of bytes
 * @returns {Buffer} - A new Buffer
 */
var hexToBytes = function(hex) {
  if (hex.substr(0, 2) === '0x') {
    return new Buffer.from(hex.substr(2), 'hex');
  }
  return Buffer.from(hex, 'hex');
};

var verifySignature = function(mHex, signatureHex, addressHex) {
  let m = hexToBytes(mHex);
  var r = signatureHex.slice(0, 66);
  var s = '0x' + signatureHex.slice(66, 130);
  var v = '0x' + signatureHex.slice(130, 132);
  var pub = ethUtil.ecrecover(m, v, r, s);
  var addr = '0x' + ethUtil.pubToAddress(pub).toString('hex');
  return addr == addressHex;
};

module.exports = {
  hashBytes,
  bytesToHex,
  hexToBytes,
  verifySignature
};
