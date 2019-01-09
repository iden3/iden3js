const Entry = require('../entry/entry');
const utils = require('../../utils');

/**
 * Class representing an assign name claim
 * Assign name claim is used to bind an identity addres with a human readable text
 * Assign name entry representation is as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |32 bytes|
 * |element 1|: |empty|identity| - |12 bytes|20 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class AssignName {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {String} _hashName - Hash regarding human readable text
   * @param {String} _id - Identity bind to the hash name
   */
  constructor(data) {
    const versionBuff = Buffer.alloc(4);

    const {
      version, hashName, id,
    } = data;
    versionBuff.writeUInt32BE(version);
    this._structure = {
      claimType: utils.hashBytes('iden3.claim.assign_name').slice(24, 32),
      version: versionBuff,
      hashName: utils.hashBytes(hashName).fill(0, 0, 1),
      id: utils.hexToBytes(id),
    };
  }

  /**
   * Retrieve raw data claim structure
   */
  get structure() {
    return this._structure;
  }

  /**
   * Code raw data claim structure into an entry claim structure
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
    // Entry element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this._structure.hashName.length;
    claimEntry.elements[2].fill(this._structure.hashName, startIndex, endIndex);
    // Entry element 1 composition
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - this._structure.id.length;
    claimEntry.elements[1].fill(this._structure.id, startIndex, endIndex);
    // Entry element 0 remains as empty value
    return claimEntry;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} entry - Entry of the claim
 * @returns {Object} AssignName class object
 */
function parseAssignName(entry) {
  const claim = new AssignName({
    version: 0, hashName: '', id: '',
  });
  // Parse element 3
  claim.structure.claimType = entry.elements[3].slice(24, 32);
  claim.structure.version = entry.elements[3].slice(20, 24);
  // Parse element 2
  claim.structure.hashName = entry.elements[2].slice(0, 32);
  // Parse element 1
  claim.structure.id = entry.elements[1].slice(12, 32);
  return claim;
}

module.exports = {
  AssignName,
  parseAssignName,
};
