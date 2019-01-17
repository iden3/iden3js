const snarkjs = require('snarkjs');
const Entry = require('../entry/entry');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;
const helpers = require('../../sparse-merkle-tree/sparse-merkle-tree-utils');

/**
 * Class representing an authorized Ksign claim with elliptic curve as secp256k1
 * This claim aims to use ethereum public key until zkSnarks are implemented using a Jubjub curve
 * Authorized KsignSecp256k1 claim is used to authorize a public key that belongs to elliptic curve secp256k1 for being used afterwards
 * Authorized KsignSecp256k1 element representation is as follows:
 * |element 3|: |empty|public key[0]|version|claim type| - |18 bytes|2 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|public key[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class AuthorizeKSignSecp256k1 {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   * @param {Object} data - Input parameters
   * Data input object contains:
   * {Uint32} version - Version assigned to the claim
   * {String} pubKeyCompressed - Public key of Secp256k1 elliptic curve in its compressed version
   */
  constructor(data) {
    const versionBuff = Buffer.alloc(4);
    const {
      version, pubKeyCompressed,
    } = data;
    versionBuff.writeUInt32BE(version);
    this._structure = {
      claimType: helpers.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.TYPE)).slice(24, 32),
      version: versionBuff,
      pubKeyCompressed: utils.hexToBytes(pubKeyCompressed),
    };
  }

  /**
   * Retrieve claim structure
   * @returns {Object} Raw data claim structure
   */
  get structure() {
    return this._structure;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  createEntry() {
    const claimEntry = new Entry();
    let endIndex = claimEntry.elements[3].length;
    let startIndex = endIndex - this._structure.claimType.length;
    // claim element 3 composition
    claimEntry.elements[3].fill(this._structure.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this._structure.version.length;
    claimEntry.elements[3].fill(this._structure.version, startIndex, endIndex);
    const indexLen = this._structure.pubKeyCompressed.length;
    const firstSlotPubKey = this._structure.pubKeyCompressed.slice(indexLen - 2, indexLen);
    endIndex = startIndex;
    startIndex = endIndex - firstSlotPubKey.length;
    claimEntry.elements[3].fill(firstSlotPubKey, startIndex, endIndex);
    // claim element 2 composition
    const secondSlotPubKey = this._structure.pubKeyCompressed.slice(0, indexLen - 2);
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - secondSlotPubKey.length;
    claimEntry.elements[2].fill(secondSlotPubKey, startIndex, endIndex);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return claimEntry;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param {Object} elements - Element representation of the claim
 * @returns {Object} AuthorizeKSign class object
 */
function parseAuthorizeKSignSecp256k1(entry) {
  const claim = new AuthorizeKSignSecp256k1({
    version: 0, pubKeyCompressed: '',
  });
  // Parse element 3
  claim.structure.claimType = entry.elements[3].slice(24, 32);
  claim.structure.version = entry.elements[3].slice(20, 24);
  // Parse element 3 and element 2
  claim.structure.pubKeyCompressed = Buffer.concat([entry.elements[2].slice(1, 32), entry.elements[3].slice(18, 20)]);
  return claim;
}

module.exports = {
  AuthorizeKSignSecp256k1,
  parseAuthorizeKSignSecp256k1,
};
