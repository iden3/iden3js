const utils = require('../utils');
const MemoryDb = require('../db/memory-db');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const authorizeKSignSecp256k1 = require('../claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1');

/**
 * given 3 hex string compressed public keys, returns an array of 3 AuthorizeKSignSecp256k1 claims for each one of the input keys
 * @param {String} kopComp - compressed public key in hex string representation
 * @param {String} krecComp - compressed public key in hex string representation
 * @param {String} krevComp - compressed public key in hex string representation
 * @returns {Array} claims - array of ClaimAuthorizeKSignSecp256K1
 */
function generateInitialClaimsAuthorizeKSign(kopComp, krecComp, krevComp) {
  const claims = [];
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, utils.bytesToHex(kopComp)));
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, utils.bytesToHex(krecComp)));
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, utils.bytesToHex(krevComp)));
  return claims;
}

/**
 * calculates the Id Genesis, from given public keys
 * @param {String} kopComp - compressed public key in hex string representation
 * @param {String} krecComp - compressed public key in hex string representation
 * @param {String} krevComp - compressed public key in hex string representation
 * @returns {String} idGenesis - hex representation of the IdGenesis
 */
function calculateIdGenesis(kopComp, krecComp, krevComp) {
  const db = new MemoryDb(false);
  const mt = new smt.SparseMerkleTree(db, '');

  const claims = generateInitialClaimsAuthorizeKSign(kopComp, krecComp, krevComp);

  for (let i = 0; i < claims.length; i++) {
    const c = utils.getArrayBigIntFromBuffArrayBE(claims[i].toEntry().elements);
    mt.addClaim(c);
  }
  const h = utils.hashBytes(mt.root);
  const idAddrBytes = h.slice(12, h.length);
  return utils.bytesToHex(idAddrBytes);
}


module.exports = {
  calculateIdGenesis,
};
