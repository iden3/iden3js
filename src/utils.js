const ethUtil = require('ethereumjs-util');
const createKeccakHash = require('keccak');

/**
 * Create a hash from a Buffer (a byte)
 *
 * @param {Buffer} b - A byte. It's a Buffer to do the hash
 * @returns {PromiseLike<ArrayBuffer>} - A hash created with keccak256
 */
const hashBytes = function(b) {
  return createKeccakHash('keccak256').update(b).digest();
};

/**
 * Decode a Buffer to a string (UTF-16)
 * @param {Buffer} buff - Buffer to decode
 * @returns {String} - Decoded Buffer in UTF-16
 */
const bytesToHex = function(buff) {
  return `0x${buff.toString('hex')}`;
};

/**
 * Allocates a new Buffer using a hexadecimal string sent
 * @param {String} hex - Hexadecimal string to parse to a Buffer of bytes
 * @returns {Buffer} - A new Buffer
 */
const hexToBytes = function(hex) {
  if (hex.substr(0, 2) === '0x') {
    return Buffer.from(hex.substr(2), 'hex');
  }

  return Buffer.from(hex, 'hex');
};

/**
 * @param  {String} str
 * @returns {String}
 */
const strToHex = function(str) {
  const arr = [];

  for (let i = 0, l = str.length; i < l; i++) {
    const hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }

  return `0x${arr.join('')}`;
};

/**
 * @param  {String} hex
 * @returns {String}
 */
const hexToStr = function(hex) {
  const _hex = hex.toString().substring(2);
  const _hexLength = _hex.length;
  let str = '';

  for (let i = 0; i < _hexLength; i += 2) {
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  }

  return str;
};

/**
 * @param  {Object} dataJson
 * @returns {String}
 */
const jsonToQr = function(dataJson) {
  const dataStr = JSON.stringify(dataJson);
  return strToHex(dataStr);
};

/**
 * @param  {String} dataHex
 * @return {Object}
 */
const qrToJson = function(dataHex) {
  const dataStr = hexToStr(dataHex); // remove the 0x
  return JSON.parse(dataStr);
};

/**
 * @param  {String} mHex
 * @param  {String} signatureHex
 * @param  {String} addressHex
 * @returns {Boolean}
 */
const verifySignature = function(mHex, signatureHex, addressHex) {
  const m = hexToBytes(mHex);
  const r = signatureHex.slice(0, 66);
  const s = `0x${signatureHex.slice(66, 130)}`;
  const v = `0x${signatureHex.slice(130, 132)}`;
  const pub = ethUtil.ecrecover(m, v, r, s);
  const addr = `0x${ethUtil.pubToAddress(pub).toString('hex')}`;

  return addr === addressHex;
};

/**
 * @param  {String} mOriginal
 * @param  {String} signatureHex
 * @returns {String} addressHex
 */
const addrFromSig = function(mOriginal, signatureHex) {
  const message = ethUtil.toBuffer(mOriginal);
  const m = ethUtil.hashPersonalMessage(message); // message hash
  const r = signatureHex.slice(0, 66);
  const s = `0x${signatureHex.slice(66, 130)}`;
  const v = `0x${signatureHex.slice(130, 132)}`;
  const pub = ethUtil.ecrecover(m, v, r, s);

  return `0x${ethUtil.pubToAddress(pub).toString('hex')}`;
};

/**
 * @param  {Buffer} hash
 * @param  {Number} difficulty
 * @returns {Boolean}
 */
const checkPoW = function(hash, difficulty) {
  for(var i=0; i<difficulty; i++) {
    if (hash[i] !== 0) {
      return false;
    }
  }
  return true;
};

/**
 * @param  {Object} data
 * @param  {Number} difficulty
 * @returns {Object}
 */
const pow = function(data, difficulty) {
  data.nonce = 0;
  let hash = hashBytes(Buffer.from(JSON.stringify(data)));
  while (!checkPoW(hash, difficulty)) {
    data.nonce++;
    hash = hashBytes(Buffer.from(JSON.stringify(data)));
  }
  return data;
};

module.exports = {
  hashBytes,
  bytesToHex,
  hexToBytes,
  strToHex,
  hexToStr,
  jsonToQr,
  qrToJson,
  verifySignature,
  addrFromSig,
  checkPoW,
  pow
};
