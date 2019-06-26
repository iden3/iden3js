// @flow
import { Entry } from './entry';

const { babyJub } = require('circomlib');
const snarkjs = require('snarkjs');
const utils = require('../utils');

const { bigInt } = snarkjs;

export const CLAIMTYPES = {
  BASIC: {
    DEF: 'basic',
    TYPE: 0,
  },
  AUTHORIZE_KSIGN_BABYJUB: {
    DEF: 'authorizeKSignBabyJub',
    TYPE: 1,
  },
  SET_ROOT_KEY: {
    DEF: 'setRootKey',
    TYPE: 2,
  },
  ASSIGN_NAME: {
    DEF: 'assignName',
    TYPE: 3,
  },
  AUTHORIZE_KSIGN_SECP256K1: {
    DEF: 'authorizeKSignSecp256k1',
    TYPE: 4,
  },
  LINK_OBJECT_IDENTITY: {
    DEF: 'linkObjectIdentity',
    TYPE: 5,
  },
  AUTHORIZE_ETH_KEY: {
    DEF: 'authorizeEthKey',
    TYPE: 9,
  },
};

/**
 * Decode a buffer as number in big endian
 * @param {Buffer} Buffer
 * @returns {number}
 */
export function buf2num(buf: Buffer): number {
  return Number(utils.bufferToBigIntBE(buf));
}

/**
 * Encode a number as a 4 byte buffer in big endian
 * @param {number} num
 * @returns {Buffer}
 */
export function num2buf(num: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(num, 0);
  return buf;
}

/**
 * Encode a number as a 2 byte buffer in big endian
 * @param {number} num
 * @returns {Buffer}
 */
export function num2buf2(num: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(num, 0);
  return buf;
}

/**
 * Hash a string for a claim
 * @param {string} elem
 * @returns {Buffer} hash
 */
export function hashString(s: string): Buffer {
  return utils.hashBytes(Buffer.from(s, 'utf8')).slice(1);
}

/**
 * Copy a buffer to an entry element ending at position start
 * @param {Buffer} elem
 * @param {number} start
 * @param {Buffer} src
 */
export function copyToElemBuf(elem: Buffer, start: number, src: Buffer) {
  elem.fill(src, 32 - start - src.length, 32 - start);
}

/**
 * Get a buffer from an entry element ending at position start
 * @param {Buffer} elem
 * @param {number} start
 * @param {number} length
 */
export function getElemBuf(elem: Buffer, start: number, length: number): Buffer {
  return elem.slice(32 - start - length, 32 - start);
}

/**
 * Set the most significant byte to 0 (in big endian)
 * @param {Buffer} elem - elem in big endian
 * @returns {Buffer} hash with the first byte set to 0
 */
export function clearElemMostSignificantByte(elem: Buffer): Buffer {
  return elem.fill(0, 0, 1);
}

/**
 * Check element in big endian must be less than claim element field
 * @param {Buffer} elem - elem in big endian
 * @throws {Error} throws an error when the check fails
 */
export function checkElemFitsClaim(elem: Buffer) {
  if (elem.length !== 32) {
    throw new Error('Element is not 32 bytes length');
  }
  const elemBigInt = utils.bufferToBigIntBE(elem);
  if (elemBigInt.greater(babyJub.p)) {
    throw new Error('Element does not fit on claim element size');
  }
}

/**
 * Check element in big endian must be length size specified
 * @param {Buffer} elem - elem in big endian
 * @param {Number} len - length that elem should be
 * @throws {Error} throws an error when the check fails
 */
export function checkByteLen(elem: Buffer, len: number) {
  if (elem.length !== len) {
    throw new Error(`Element is not ${len} bytes length`);
  }
}

/**
 * Set the claim type and version of an entry
 * @param {Object} entry - Entry of the claim
 * @param {number} claimType
 * @param {number} version
 */
export function setClaimTypeVersion(entry: Entry, claimType: number, version: number) {
  const claimTypeBuf = utils.bigIntToBufferBE(bigInt(claimType)).slice(24, 32);
  copyToElemBuf(entry.elements[3], 0, claimTypeBuf);
  copyToElemBuf(entry.elements[3], 8, num2buf(version));
}

/**
 * get the claim type and version of an entry
 * @param {Object} entry - Entry of the claim
 * @returns {Object} type and version
 */
export function getClaimTypeVersion(entry: Entry): { claimType: number, version: number } {
  return {
    claimType: buf2num(getElemBuf(entry.elements[3], 0, 8)),
    version: buf2num(getElemBuf(entry.elements[3], 8, 4)),
  };
}

/**
 * Increase `version` data field by 1
 * @param {Entry} claim - Claim to increase its version value
 */
export function incClaimVersion(claim: Entry) {
  const version = claim.elements[3].slice(20, 24).readUInt32BE(0);
  claim.elements[3].writeUInt32BE(version + 1, claim.elements[3].length - 64 / 8 - 32 / 8);
}
