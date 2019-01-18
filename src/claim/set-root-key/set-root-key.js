const snarkjs = require('snarkjs');
const Entry = require('../entry/entry');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;
const helpers = require('../../sparse-merkle-tree/sparse-merkle-tree-utils');

/**
 * Class representing a set root key claim
 * Set root key claim is used to commit a root of a merkle by a given identity
 * Assign name entry representation is as follows:
 * |element 3|: |empty|era|version|claim type| - |16 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |12 bytes|20 bytes|
 * |element 1|: |root key| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class SetRootKey {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   * @param {Object} data - Input parameters
   * Data input object contains:
   * {Uint32} version - Version assigned to the claim
   * {Uint32} era - Era assigned to the claim
   * {String} id - Identity bind to the hash name
   * {String} rootKey - Root key to commit
   */
  constructor(data) {
    const versionBuff = Buffer.alloc(4);
    const eraBuff = Buffer.alloc(4);

    const {
      version, era, id, rootKey,
    } = data;
    versionBuff.writeUInt32BE(version);
    eraBuff.writeUInt32BE(era);
    this._structure = {
      claimType: helpers.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.SET_ROOT_KEY.TYPE)).slice(24, 32),
      version: versionBuff,
      era: eraBuff,
      id: utils.hexToBytes(id),
      rootKey: utils.hexToBytes(rootKey),
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
   * @returns {Object} Entry representation of the claim
   */
  createEntry() {
    const claimEntry = new Entry();
    let endIndex = claimEntry.elements[3].length;
    let startIndex = endIndex - this._structure.claimType.length;
    // Entry element 3 composition
    claimEntry.elements[3].fill(this._structure.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this._structure.version.length;
    claimEntry.elements[3].fill(this._structure.version, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this._structure.era.length;
    claimEntry.elements[3].fill(this._structure.era, startIndex, endIndex);
    // Entry element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this._structure.id.length;
    claimEntry.elements[2].fill(this._structure.id, startIndex, endIndex);
    // Entry element 1 composition
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - this._structure.rootKey.length;
    claimEntry.elements[1].fill(this._structure.rootKey, startIndex, endIndex);
    // Entry element 0 remains as empty value
    return claimEntry;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param {Object} entry - Entry of the claim
 * @returns {Object} SetRootKey class object
 */
function parseSetRootKey(entry) {
  const claim = new SetRootKey({
    version: 0, era: '', id: '', rootKey: '',
  });
  // Parse element 3
  claim.structure.claimType = entry.elements[3].slice(24, 32);
  claim.structure.version = entry.elements[3].slice(20, 24);
  claim.structure.era = entry.elements[3].slice(16, 20);
  // Parse element 2
  claim.structure.id = entry.elements[2].slice(12, 32);
  // Parse element 1
  claim.structure.rootKey = entry.elements[1].slice(0, 32);
  return claim;
}

module.exports = {
  SetRootKey,
  parseSetRootKey,
};
