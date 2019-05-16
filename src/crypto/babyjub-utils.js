// @flow

const { babyJub, eddsa } = require('circomlib');
const crypto = require('crypto');
const { bigInt } = require('snarkjs');
const createBlakeHash = require('blake-hash');

const utils = require('../utils');


const baseBabyJub = babyJub.Base8;

/**
 * Get compressed point given a public key compsed by coordinate X and Y
 * @param {Buffer} pubKeyX - Coordinate X of public key
 * @param {Buffer} pubKeyY - Coordinate Y of public key
 * @returns {Buffer} - Public key compressed
 */
function compressPoint(pubKeyX: Buffer, pubKeyY: Buffer): Buffer {
  const pubKeyXBigInt = utils.bufferToBigInt(pubKeyX);
  if (pubKeyXBigInt.greater(babyJub.p.shr(1))) {
    pubKeyY[0] |= 0x80;
  }
  return pubKeyY;
}

/**
 * Get number of bits given a big integer
 * @param {bigInt} number - big integer
 * @returns {number} - number of bits necessary to represent big integer input
 */
function bigIntbits(number: bigInt): number {
  let numBits = 0;
  while (!number.isZero()) {
    number = number.shr(1);
    numBits += 1;
  }
  return numBits;
}

/**
 * Generates a random private key in a subgroup specified by the babyjub field
 * @returns {string} - Hexadecimal string
 */
function genPriv(): string {
  const randBytes = crypto.randomBytes(Math.floor(256 / 8));
  const randHex = utils.bytesToHex(randBytes);
  return randHex;
}

/**
 * Retrieve uniform scalar in babyjub curve subgroup
 * @param {Buffer} privKey - Private key
 * @returns {bigInt} scalar in subgroup babyjub order
 */
function privToScalar(privKey: Buffer): bigInt {
  const h1 = createBlakeHash('blake512').update(privKey).digest();
  const sBuff = eddsa.pruneBuffer(h1.slice(0, 32));
  const scalar = (bigInt.leBuff2int(sBuff)).shr(3);
  if (scalar >= babyJub.p) {
    throw new Error('scalar generated larger than subgroup');
  }
  return scalar;
}

/**
 * Retrieve public key from private key in a babyjub curve
 * @param {Buffer} privKey - Private key
 * @param {bool} compress - Flag to indicate if output is public key compresed or not
 * @returns {Buffer} New public key generated
 */
function privToPub(privKey: Buffer, compress: boolean): Buffer {
  if (privKey.length !== 32) {
    throw new Error(`Input Error: Buffer has ${privKey.length} bytes. It should be 32 bytes`);
  }
  const scalar = privToScalar(privKey);
  const pubKey = babyJub.mulPointEscalar(baseBabyJub, scalar);
  const pubKeyX = utils.bigIntToBuffer(pubKey[0]);
  const pubKeyY = utils.bigIntToBuffer(pubKey[1]);
  if (!babyJub.inSubgroup(pubKey)) {
    throw new Error('Point generated not in babyjub subgroup');
  }
  if (!compress) {
    return Buffer.concat([pubKeyX, pubKeyY]);
  }
  return compressPoint(pubKeyX, pubKeyY);
}

module.exports = {
  privToScalar,
  privToPub,
  genPriv,
  bigIntbits,
  compressPoint,
};
