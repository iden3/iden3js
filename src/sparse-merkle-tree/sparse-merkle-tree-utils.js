const snarkjs = require('snarkjs');
const utils = require('../utils');

const { bigInt } = snarkjs;

/**
* Sets bit to 1 into a Uint8
* @param {Uint8} buff - Buffer
* @returns {Uint8} pos - Position of the bit to set
*/
function setBit(byte, pos) {
  let mask = 1;
  while (pos) {
    mask <<= 1;
    pos -= 1;
  }
  return byte | mask;
}

/**
* Gets a concrete bit of a Uint8
* @param {Uint8} byte - Byte to get the bit
* @returns {Uint8} pos - Position of the bit to get
*/
function getBit(byte, pos) {
  return (byte >> pos) & 0x01;
}

/**
* Gets binary representation of leaf position
* @param {bigInt} _index - Hash index of the leaf
* @returns {Array} - Array of bits determining leaf position
*/
function getIndexArray(_index) {
  const index = bigInt(_index);
  return index.toArray(2).value.reverse();
}

/**
* Allocates a new Buffer from a bigInt number
* @param {bigInt} _number - bigInt number
* @returns {Buffer} - Decoded Buffer in UTF-16
*/
function bigIntToBuffer(number) {
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
* @param {Buffer} _buff - bigInt number
* @returns {Buffer} - Decoded Buffer in UTF-16
*/
function bufferToBigInt(buff) {
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
* @param {Object} nodeValue - Object representation of node value data
* @returns {Buffer} - New buffer
*/
function nodeValueToBuffer(nodeValue) {
  return Buffer.concat(nodeValue);
}

/**
* Decode a buffer into an object represenation of node value
* @param {Buffer} nodeValueBuffer - Buffer to decode
* @returns {Object} - New object containing node value data
*/
function bufferToNodeValue(nodeValueBuffer) {
  const arrayBuff = [];
  for (let i = 0; i < nodeValueBuffer.length - 1; i += 32) {
    const buffTmp = Buffer.alloc(32);
    buffTmp.fill(nodeValueBuffer.slice(i, i + 32));
    arrayBuff.push(buffTmp);
  }
  return arrayBuff;
}

/**
* Gets binary representation of leaf position
* @param {bigInt} _index - Hash index of the leaf
* @returns {Array} - Array of bits determining leaf position
*/
function getArrayBuffFromArrayBigInt(arrayBigInt) {
  const arrayBuff = [];
  for (let i = 0; i < arrayBigInt.length; i++) {
    arrayBuff.push(bigIntToBuffer(arrayBigInt[i]));
  }
  return arrayBuff;
}

/**
* Gets binary representation of leaf position
* @param {bigInt} _index - Hash index of the leaf
* @returns {Array} - Array of bits determining leaf position
*/
function getArrayBigIntFromBuffArray(arrayBuff) {
  const arrayBigInt = [];
  for (let i = 0; i < arrayBuff.length; i++) {
    arrayBigInt.push(bufferToBigInt(arrayBuff[i]));
  }
  return arrayBigInt;
}

/**
* Gets proof object given a string hexadecimal encoded
* @param {String} buffHex - hexadecimal string to parse
* @returns {Object} - -structure proof
*/
function parseProof(buffHex) {
  const buffBytes = utils.hexToBytes(buffHex);
  const flag = buffBytes.readUInt8();
  const bitDiff = getBit(flag, 1);
  let proofStruct;
  if (bitDiff) {
    proofStruct = {
      flagExistence: flag,
      siblingsLength: buffBytes.readUInt8(1),
      siblingsBitIndex: buffBytes.slice(2, 32),
      siblings: buffBytes.slice(32, buffBytes.length - 2),
      metaData: buffBytes.slice(buffBytes.length - 2, buffBytes.length),
    };
  } else {
    proofStruct = {
      flagExistence: flag,
      siblingsLength: buffBytes.readUInt8(1),
      siblingsBitIndex: buffBytes.slice(2, 32),
      siblings: buffBytes.slice(32, buffBytes.length),
    };
  }
  return proofStruct;
}

/**
* Gets proof object given a string hexadecimal encoded
* @param {String} buffHex - hexadecimal string to parse
* @returns {Object} - -structure proof
*/
function genProofStruct(buffHex) {
  const buffBytes = utils.hexToBytes(buffHex);
  return {
    flagExistence: buffBytes.readUInt8(),
    siblingsLength: buffBytes.readUInt8(),
    siblings: buffBytes.slice(1, buffBytes.length - 2),
    metadataNode: buffBytes.slice(buffBytes.length - 2, buffBytes.length),
  };
}

module.exports = {
  getBit,
  parseProof,
  getArrayBigIntFromBuffArray,
  getArrayBuffFromArrayBigInt,
  bufferToNodeValue,
  nodeValueToBuffer,
  bufferToBigInt,
  bigIntToBuffer,
  getIndexArray,
  setBit,
};
