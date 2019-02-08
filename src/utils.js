// @flow
const ethUtil = require('ethereumjs-util');
const createKeccakHash = require('keccak');

/**
 * @param  {uint32} u
 * @returns {Buffer}
 */
function uint32ToEthBytes(u: number): Buffer { // compatible with Uint32ToEthBytes() go-iden3 version
  const buf = Buffer.alloc(4);
  buf.writeUIntBE(u, 0, 4); // also can be used buf.writeUInt32BE(u);
  return buf;
}

/**
 * @param  {Buffer} b
 * @returns {uint32}
 */
function ethBytesToUint32(b: Buffer): number { // compatible with EthBytesToUint32() go-iden3 version
  return b.readUIntBE(0, 4);
}

/**
 * @param  {uint64} u
 * @returns {Buffer}
 */
function uint64ToEthBytes(u: number): Buffer { // compatible with Uint64ToEthBytes() go-iden3 version
  const buf = Buffer.alloc(8);
  buf.writeUIntBE(u, 0, 8);
  return buf;
}

/**
 * @param  {Buffer} b
 * @returns {uint64}
 */
function ethBytesToUint64(b: Buffer): number { // compatible with EthBytesToUint64() go-iden3 version
  return b.readUIntBE(0, 8);
}

/**
 * Create a hash from a Buffer (a byte)
 *
 * @param {Buffer} b - A byte. It's a Buffer to do the hash
 * @returns {PromiseLike<ArrayBuffer>} - A hash created with keccak256
 */
function hashBytes(b: Buffer): any {
  return createKeccakHash('keccak256').update(b).digest();
}

/**
 * Decode a Buffer to a string (UTF-16)
 * @param {Buffer} buff - Buffer to decode
 * @returns {String} - Decoded Buffer in UTF-16
 */
function bytesToHex(buff: Buffer): string {
  return `0x${buff.toString('hex')}`;
}

/**
 * Allocates a new Buffer using a hexadecimal string sent
 * @param {String} hex - Hexadecimal string to parse to a Buffer of bytes
 * @returns {Buffer} - A new Buffer
 */
function hexToBytes(hex: string): Buffer {
  if (hex.substr(0, 2) === '0x') {
    return Buffer.from(hex.substr(2), 'hex');
  }

  return Buffer.from(hex, 'hex');
}

/**
 * @param  {String} str
 * @returns {String}
 */
function strToHex(str: string): string {
  const arr = [];

  for (let i = 0, l = str.length; i < l; i++) {
    const hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }

  return `0x${arr.join('')}`;
}

/**
 * @param  {String} hex
 * @returns {String}
 */
function hexToStr(hex: string): string {
  const _hex = hex.toString().substring(2);
  const _hexLength = _hex.length;
  let str = '';

  for (let i = 0; i < _hexLength; i += 2) {
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  }

  return str;
}

/**
 * @param  {Object} dataJson
 * @returns {String}
 */
function jsonToQr(dataJson: any): string {
  const dataStr = JSON.stringify(dataJson);
  return strToHex(dataStr);
}

/**
 * @param  {String} dataHex
 * @return {Object}
 */
function qrToJson(dataHex: string): any {
  const dataStr = hexToStr(dataHex); // remove the 0x
  return JSON.parse(dataStr);
}

/**
 * @param  {String} mHex
 * @param  {String} signatureHex
 * @param  {String} addressHex
 * @returns {Boolean}
 */
function verifySignature(mHex: string, signatureHex: string, addressHex: string): boolean {
  const m = hexToBytes(mHex);
  const r = signatureHex.slice(0, 66);
  const s = `0x${signatureHex.slice(66, 130)}`;
  const v = `0x${signatureHex.slice(130, 132)}`;
  const pub = ethUtil.ecrecover(m, v, r, s);
  const addr = `0x${ethUtil.pubToAddress(pub).toString('hex')}`;

  return addr === addressHex;
}

/**
 * @param  {String} mOriginal
 * @param  {String} signatureHex
 * @returns {String} addressHex
 */
function addrFromSig(mOriginal: string, signatureHex: string): string {
  const message = ethUtil.toBuffer(mOriginal);
  const m = ethUtil.hashPersonalMessage(message); // message hash
  const r = signatureHex.slice(0, 66);
  const s = `0x${signatureHex.slice(66, 130)}`;
  const v = `0x${signatureHex.slice(130, 132)}`;
  const pub = ethUtil.ecrecover(m, v, r, s);

  return `0x${ethUtil.pubToAddress(pub).toString('hex')}`;
}

/**
 * @param  {Buffer} hash
 * @param  {Number} difficulty
 * @returns {Boolean}
 */
function checkPoW(hash: Buffer, difficulty: number): boolean {
  if (Buffer.compare(hash.slice(0, difficulty), Buffer.alloc(difficulty)) !== 0) {
    return false;
  }
  return true;
}

/**
 * @param  {Object} data
 * @param  {Number} difficulty
 * @returns {Object}
 */
function pow(data: any, difficulty: number): any {
  data.nonce = 0;
  let hash = hashBytes(Buffer.from(JSON.stringify(data)));
  while (!checkPoW(hash, difficulty)) {
    data.nonce += 1;
    hash = hashBytes(Buffer.from(JSON.stringify(data)));
  }
  return data;
}

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
  pow,
  uint32ToEthBytes,
  ethBytesToUint32,
  uint64ToEthBytes,
  ethBytesToUint64,
};
