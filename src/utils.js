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

/**
 * @param  {String} str
 * @returns {String}
 */
var strToHex = function(str) {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return '0x' + arr.join('');
}

/**
 * @param  {String} hexx
 * @returns {String}
 */
var hexToStr = function(hexx) {
  hexx = hexx.substring(2);
  var hex = hexx.toString(); //force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

/**
 * @param  {Object} dataJson
 * @returns {String}
 */
var jsonToQr = function(dataJson) {
  let dataStr = JSON.stringify(dataJson);
  let dataHex = strToHex(dataStr);
  return dataHex;
}

/**
 * @param  {String} dataHex
 * @return {Object}
 */
var qrToJson = function(dataHex) {
  let dataStr = hexToStr(dataHex); // remove the 0x
  let data = JSON.parse(dataStr);
  return data;
}

/**
 * @param  {String} mHex
 * @param  {String} signatureHex
 * @param  {String} addressHex
 * @returns {Boolean}
 */
var verifySignature = function(mHex, signatureHex, addressHex) {
  let m = hexToBytes(mHex);
  let r = signatureHex.slice(0, 66);
  let s = '0x' + signatureHex.slice(66, 130);
  let v = '0x' + signatureHex.slice(130, 132);
  let pub = ethUtil.ecrecover(m, v, r, s);
  let addr = '0x' + ethUtil.pubToAddress(pub).toString('hex');
  return addr == addressHex;
};

module.exports = {
  hashBytes,
  bytesToHex,
  hexToBytes,
  strToHex,
  hexToStr,
  jsonToQr,
  qrToJson,
  verifySignature
};
