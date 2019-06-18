const bs58 = require('bs58');
const utils = require('../utils');
const Db = require('../db/db');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const claim = require('../claim/claim');

const TypeBJM7 = Buffer.from([0x00, 0x00]);
// const TypeS2M7 = Buffer.from([0x00, 0x04]);

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
  const toChecksum = Buffer.concat([typ, genesis]);
  let s = 0;
  for (let i = 0; i < toChecksum.length; i++) {
    s += toChecksum[i];
  }
  const checksum = Buffer.alloc(2);
  checksum[0] = s >> 8;
  checksum[1] = s & 0xff;
  return checksum;
}

/**
 * checks the checksum of a given identity
 * @param {Buffer} id - id
 * @returns {bool} - true if the checksum is correct, false if not
 */
function checkChecksum(id) {
  const decomposed = decomposeID(id);
  const c = calculateChecksum(decomposed.type, decomposed.genesis);
  return (Buffer.compare(decomposed.checksum, c) === 0);
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
 * get identity base58 string from buffer, checking the checksum
 * @param {Buffer} b - id in Buffer format
 * @returns {String} id in String base58 format
 */
function stringFromBufferId(b) {
  if (!checkChecksum(b)) {
    throw new Error('id error: checksum verification error');
  }
  return bs58.encode(b);
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
 * calculates the Id Genesis, from given public keys
 * @param {String} kop - compressed babyjub public key in hex string representation
 * @param {String} kdis - eth addr in hex string
 * @param {String} kreen - eth addr in hex string
 * @param {String} kupdateRoot - eth addr in hex string
 * @returns {String} idGenesis - hex representation of the IdGenesis
 */
function calculateIdGenesis(kop, kdis, kreen, kupdateRoot) {
  const db = new Db.Memory(false);
  const mt = new smt.SparseMerkleTree(db, '');

  const claimKOp = new claim.AuthorizeKSignBabyJub(kop);
  mt.addEntry(claimKOp.toEntry());

  const claimKDis = new claim.AuthorizeEthKey(kdis, claim.ETH_KEY_TYPE.DISABLE);
  mt.addEntry(claimKDis.toEntry());

  const claimKReen = new claim.AuthorizeEthKey(kreen, claim.ETH_KEY_TYPE.REENABLE);
  mt.addEntry(claimKReen.toEntry());

  const claimKUpdateRoot = new claim.AuthorizeEthKey(kupdateRoot, claim.ETH_KEY_TYPE.UPDATE_ROOT);
  mt.addEntry(claimKUpdateRoot.toEntry());

  const proofBuffKOp = mt.generateProof(claimKOp.toEntry().hiBigInt());
  const proofKOp = utils.bytesToHex(proofBuffKOp);
  const proofBuffKDis = mt.generateProof(claimKDis.toEntry().hiBigInt());
  const proofKDis = utils.bytesToHex(proofBuffKDis);
  const proofBuffKReen = mt.generateProof(claimKReen.toEntry().hiBigInt());
  const proofKReen = utils.bytesToHex(proofBuffKReen);
  const proofBuffKUpdateRoot = mt.generateProof(claimKUpdateRoot.toEntry().hiBigInt());
  const proofKUpdateRoot = utils.bytesToHex(proofBuffKUpdateRoot);

  const idGenesisBuffer = mt.root.slice(mt.root.length - 27, mt.root.lenth);
  const id = newID(TypeBJM7, idGenesisBuffer);

  return {
    id: bs58.encode(id),
    proofKeyOperationalPub: proofKOp,
    proofKeyDisable: proofKDis,
    proofKeyReenable: proofKReen,
    proofKeyUpdateRoot: proofKUpdateRoot,
  };
}


module.exports = {
  newID,
  idFromString,
  idFromBuffer,
  stringFromBufferId,
  decomposeID,
  calculateChecksum,
  checkChecksum,
  calculateIdGenesis,
};
