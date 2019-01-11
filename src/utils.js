const ethUtil = require('ethereumjs-util');
const createKeccakHash = require('keccak');


/**
 * @param  {uint32} u
 * @returns {Buffer}
 */
const uint32ToEthBytes = function (u) { // compatible with Uint32ToEthBytes() go-iden3 version
  const buf = Buffer.alloc(4);
  buf.writeUIntBE(u, 0, 4); // also can be used buf.writeUInt32BE(u);
  return buf;
};

/**
 * @param  {Buffer} b
 * @returns {uint32}
 */
const ethBytesToUint32 = function (b) { // compatible with EthBytesToUint32() go-iden3 version
  return b.readUIntBE(0, 4);
};

/**
 * @param  {uint64} u
 * @returns {Buffer}
 */
const uint64ToEthBytes = function (u) { // compatible with Uint64ToEthBytes() go-iden3 version
  const buf = Buffer.alloc(8);
  buf.writeUIntBE(u, 0, 8);
  return buf;
};

/**
 * @param  {Buffer} b
 * @returns {uint64}
 */
const ethBytesToUint64 = function (b) { // compatible with EthBytesToUint64() go-iden3 version
  return b.readUIntBE(0, 8);
};

/**
 * Create a hash from a Buffer (a byte)
 *
 * @param {Buffer} b - A byte. It's a Buffer to do the hash
 * @returns {PromiseLike<ArrayBuffer>} - A hash created with keccak256
 */
const hashBytes = function (b) {
  return createKeccakHash('keccak256').update(b).digest();
};

/**
 * Decode a Buffer to a string (UTF-16)
 * @param {Buffer} buff - Buffer to decode
 * @returns {String} - Decoded Buffer in UTF-16
 */
const bytesToHex = function (buff) {
  return `0x${buff.toString('hex')}`;
};

/**
 * Allocates a new Buffer using a hexadecimal string sent
 * @param {String} hex - Hexadecimal string to parse to a Buffer of bytes
 * @returns {Buffer} - A new Buffer
 */
const hexToBytes = function (hex) {
  if (hex.substr(0, 2) === '0x') {
    return Buffer.from(hex.substr(2), 'hex');
  }

  return Buffer.from(hex, 'hex');
};

/**
 * @param  {String} str
 * @returns {String}
 */
const strToHex = function (str) {
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
const hexToStr = function (hex) {
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
const jsonToQr = function (dataJson) {
  const dataStr = JSON.stringify(dataJson);
  return strToHex(dataStr);
};

/**
 * @param  {String} dataHex
 * @return {Object}
 */
const qrToJson = function (dataHex) {
  const dataStr = hexToStr(dataHex); // remove the 0x
  return JSON.parse(dataStr);
};

/**
 * @param  {String} mHex
 * @param  {String} signatureHex
 * @param  {String} addressHex
 * @returns {Boolean}
 */
const verifySignature = function (mHex, signatureHex, addressHex) {
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
const addrFromSig = function (mOriginal, signatureHex) {
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
const checkPoW = function (hash, difficulty) {
  if (Buffer.compare(hash.slice(0, difficulty), Buffer.alloc(difficulty)) !== 0) {
    return false;
  }
  return true;
};

/**
 * @param  {Object} data
 * @param  {Number} difficulty
 * @returns {Object}
 */
const pow = function (data, difficulty) {
  data.nonce = 0;
  let hash = hashBytes(Buffer.from(JSON.stringify(data)));
  while (!checkPoW(hash, difficulty)) {
    data.nonce += 1;
    hash = hashBytes(Buffer.from(JSON.stringify(data)));
  }
  return data;
};

const claimEntry = (function entriesOfClaim() {
  /*const e0 = Buffer.alloc(32);
  const e1 = Buffer.alloc(32);
  const e2 = Buffer.alloc(32);
  const e3 = Buffer.alloc(32); */
  const elements = Array.from(Array(4).keys());

  elements.fill(Buffer.alloc(32), 0, elements.length);

  /**
   * Hash index calculation using mimc7 hash
   * Hash index is calculated from: |element 1|element 0|
   * @returns {Buffer} Hash index of the claim element structure
   */
  const hi = function hashIndex() {
    const hashArray = [elements[2], elements[3]];
    const hashKey = mimc7.smtHash(helpers.getArrayBigIntFromBuffArray(hashArray));
    return helpers.bigIntToBuffer(hashKey);
  };

  /**
   * Hash value calculation using mimc7 hash
   * Hash value is calculated from: |element 3|element 2|
   * @returns {Buffer} Hash value of the claim element structure
   */
  const hv = function hashValue() {
    const hashArray = [elements[0], elements[1]];
    const hashKey = mimc7.smtHash(helpers.getArrayBigIntFromBuffArray(hashArray));
    return helpers.bigIntToBuffer(hashKey);
  };

  /**
   * Concats all the elements of the claim and parse it into an hexadecimal string
   * @returns {String} Hexadecimal string representation of element claim structure
   */
  const hex = function toHexadecimal() {
    return this.bytesToHex(Buffer.concat(elements));
  };

  return {
    elements,
    hex,
    hi,
    hv,
  };
}());

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
  claimEntry,
};
