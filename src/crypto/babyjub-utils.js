// @flow

const { babyJub } = require('circomlib');
const utils = require('../utils');

const baseBabyJub = babyJub.Base8;
const mimc7 = require('../sparse-merkle-tree/mimc7');

/**
 * Retrieve public key from private key in a babyjub curve
 * @param {Buffer} privKey - Private key
 * @param {bool} compress - Flag to indicate if output is public key compresed or not
 * @returns {Buffer} New public key generated
 */
function privToPub(privKey: Buffer, compress: boolean): Buffer {
  // Make uniform output from input buffer
  const hashPriv = utils.hashBytes(privKey);
  const scalar = mimc7.multiHash([utils.bufferToBigInt(hashPriv.slice(1, 31))]);
  if (scalar.shr(3) >= babyJub.subOrder) {
    throw new Error('Scalar generated larger than subgroup');
  }
  // TODO: Does scalar should be in subgrup field ? Security implications ?
  const pubKey = babyJub.mulPointEscalar(baseBabyJub, scalar.shr(3));
  if (!babyJub.inSubgroup(pubKey)) {
    throw new Error('Point generated not in babyjub subgroup');
  }
  if (!compress) {
    const pubKeyX = utils.bigIntToBuffer(pubKey[0]);
    const pubKeyY = utils.bigIntToBuffer(pubKey[1]);
    return Buffer.concat([pubKeyX, pubKeyY]);
  }
  return babyJub.packPoint(pubKey);
}

module.exports = {
  privToPub,
};
