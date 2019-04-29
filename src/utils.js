// @flow
const ethUtil = require('ethereumjs-util');
const createKeccakHash = require('keccak');

const snarkjs = require('snarkjs');

const { bigInt } = snarkjs;

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
 * Decode a Buffer to a base64 format string
 * @param {Buffer} buff - Buffer to decode
 * @returns {String} - Decoded Buffer in base64
 */
function bytesToBase64(buff: Buffer): string {
  return buff.toString('base64');
}

/**
 * Allocates a new Buffer using a base64 string format
 * @param {String} strBase64 - Base64 string format to parse to a Buffer of bytes
 * @returns {Buffer} - New parsed Buffer
 */
function base64ToBytes(strBase64: string): Buffer {
  return Buffer.from(strBase64, 'base64');
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


/**
* Allocates a new Buffer from a bigInt number
* @param {bigInt} number - bigInt number
* @returns {Buffer} - Decoded Buffer in UTF-16
*/
function bigIntToBuffer(number: bigInt): Buffer {
  const buff = Buffer.alloc(32);
  let pos = buff.length - 1;
  while (!number.isZero()) {
    buff[pos] = number.and(255);
    number = number.shiftRight(8);
    pos -= 1;
  }
  return buff;
}

/**
* Allocates a new bigInt from a buffer
* @param {Buffer} buff - Buffer to convert
* @returns {bigInt} - Decoded bigInt
*/
function bufferToBigInt(buff: Buffer): bigInt {
  let number = bigInt(0);
  let pos = buff.length - 1;
  while (pos >= 0) {
    let tmpNum = bigInt(buff[pos]);
    tmpNum = tmpNum.shiftLeft(8 * (buff.length - 1 - pos));

    number = number.add(tmpNum);
    pos -= 1;
  }
  return number;
}

/**
* Create a buffer from a node object
* @param {Array(Buffer)} buffArray - array of buffers
* @returns {Buffer} - New buffer
*/
function buffArrayToBuffer(buffArray: Array<Buffer>): Buffer {
  return Buffer.concat(buffArray);
}

/**
* Decode a buffer into an object represenation of node value
* @param {Buffer} buffer - Buffer to decode
* @returns {Array<Buffer>} - array of buffers
*/
function bufferToBuffArray(buff: Buffer): Array<Buffer> {
  const arrayBuff = [];
  for (let i = 0; i < buff.length - 1; i += 32) {
    const buffTmp = Buffer.alloc(32);
    buffTmp.fill(buff.slice(i, i + 32));
    arrayBuff.push(buffTmp);
  }
  return arrayBuff;
}

/**
* Gets an array of buffers from bigInt array
* @param {Array(bigInt)} arrayBigInt - Hash index of the leaf
* @returns {Array(Buffer)} - Array of decoded buffers
*/
function getArrayBuffFromArrayBigInt(arrayBigInt: Array<bigInt>): Array<Buffer> {
  const arrayBuff = [];
  for (let i = 0; i < arrayBigInt.length; i++) {
    arrayBuff.push(bigIntToBuffer(arrayBigInt[i]));
  }
  return arrayBuff;
}

/**
* Gets an array of bigInt from buffer array
* @param {Array(Buffer)} arrayBuff - Array of buffer to decode
* @returns {Array(bigInt)} - Array of bigInt decoded
*/
function getArrayBigIntFromBuffArray(arrayBuff: Array<Buffer>): Array<bigInt> {
  const arrayBigInt = [];
  for (let i = 0; i < arrayBuff.length; i++) {
    arrayBigInt.push(bufferToBigInt(arrayBuff[i]));
  }
  return arrayBigInt;
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
  bytesToBase64,
  base64ToBytes,
  bigIntToBuffer,
  bufferToBigInt,
  buffArrayToBuffer,
  bufferToBuffArray,
  getArrayBuffFromArrayBigInt,
  getArrayBigIntFromBuffArray,
};
