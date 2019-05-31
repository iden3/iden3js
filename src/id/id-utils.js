const bs58 = require('bs58');
const utils = require('../utils');
const Db = require('../db/db');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const authorizeKSignSecp256k1 = require('../claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1');

const TypeS2M7 = Buffer.from([0x00, 0x04]);

/**
 * from a given id (Buffer), returns an object containing:
 * {
 *      type,
 *      genesis,
 *      checksum
 * }
 * @param {Buffer} id - id
 * @returns {Object} - object {type, genesis, checksum}
 */
function decomposeID(id) {
  const typ = id.slice(0, 2);
  const genesis = id.slice(2, id.length - 2);
  const checksum = id.slice(id.length - 2, id.length);
  return {
    type: typ,
    genesis,
    checksum,
  };
}

/**
 * Calculates the checksum for a given type & genesis
 * @param {Buffer} typ - type of identity specification
 * @param {Buffer} genesis - genesis root of the id state: id_0.0
 * @returns {Buffer} checksum
 */
function calculateChecksum(typ, genesis) {
  const toHash = Buffer.concat([typ, genesis]);
  const h = utils.hashBytes(toHash);
  const checksum = h.slice(h.length - 2, h.length);
  return checksum;
}

/**
 * checks the checksum of a given identity
 * @param {Buffer} id - id
 * @returns {bool} - true if the checksum is correct, false if not
 */
function checkChecksum(id) {
  const decomposed = decomposeID(id);
  const c = calculateChecksum(decomposed.typ, decomposed.genesis);
  return Buffer.compare(decomposed.checksum, c);
}

/**
 * parse identity from buffer, checking the checksum
 * @param {string} s - id in base58 string representation
 * @returns {Buffer} id
 */
function idFromBuffer(b) {
  if (b.length !== 31) {
    throw new Error('id error: not valid length');
  }
  if (!checkChecksum(b)) {
    throw new Error('id error: checksum verification error');
  }
  return b;
}

/**
 * parse identity from string, checking the checksum
 * @param {string} s - id in base58 string representation
 * @returns {Buffer} id
 */
function idFromString(s) {
  const b = bs58.decode(s);
  return idFromBuffer(b);
}

/**
 * creates an identity given type & genesis
 * where the id will be [ typ | genesis | checksum ]
 * @param {Buffer} typ - type of identity specification
 * @param {Buffer} genesis - genesis root of the id state: id_0.0
 * @returns {Buffer} id
 */
function newID(typ, genesis) {
  const checksum = calculateChecksum(typ, genesis);
  // as this is not a typed language, the .slice(0, x) is to make sure that the variables are of the desired length
  const id = Buffer.concat([typ.slice(0, 2), genesis.slice(0, 27), checksum.slice(0, 2)]);
  return id;
}

/**
 * given 3 hex string compressed public keys, returns an array of 3 AuthorizeKSignSecp256k1 claims for each one of the input keys
 * @param {String} kopComp - compressed public key in hex string representation
 * @param {String} krecComp - compressed public key in hex string representation
 * @param {String} krevComp - compressed public key in hex string representation
 * @returns {Array} claims - array of ClaimAuthorizeKSignSecp256K1
 */
function generateInitialClaimsAuthorizeKSign(kopComp, krecComp, krevComp) {
  const claims = [];
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, kopComp));
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, krecComp));
  claims.push(authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(0, krevComp));
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
  const db = new Db.Memory(false);
  const mt = new smt.SparseMerkleTree(db, '');

  const claims = generateInitialClaimsAuthorizeKSign(kopComp, krecComp, krevComp);

  for (let i = 0; i < claims.length; i++) {
    const c = utils.getArrayBigIntFromBuffArrayBE(claims[i].toEntry().elements);
    mt.addClaim(c);
  }
  const idGenesisBuffer = mt.root.slice(0, 27);
  const id = newID(TypeS2M7, idGenesisBuffer);
  return bs58.encode(id);
}


module.exports = {
  newID,
  idFromString,
  idFromBuffer,
  decomposeID,
  calculateChecksum,
  checkChecksum,
  generateInitialClaimsAuthorizeKSign,
  calculateIdGenesis,
};
