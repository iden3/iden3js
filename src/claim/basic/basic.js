const Entry = require('../entry/entry');
const utils = require('../../utils');

/**
 * Class representing a basic claim
 * Basic claim is used to issue generic data
 * Index and Data are split into two fields to fit claim element data structure
 * Basic entry representation is as follows:
 * |element 3|: |empty|index[0]|version|claim type| - |1 byte|19 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|index[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty|data[0]| - |1 bytes|31 bytes|
 * |element 0|: |empty|data[1]| - |1 bytes|31 bytes|
 */
class Basic {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {String} _index - Generic index data
   * @param {String} _data - Generic data
   */
  constructor(data) {
    const versionBuff = Buffer.alloc(4);

    const {
      version, index, extraData,
    } = data;
    versionBuff.writeUInt32BE(version);
    this._structure = {
      claimType: utils.hashBytes('iden3.claim.basic').slice(24, 32),
      version: versionBuff,
      index: utils.hexToBytes(index),
      extraData: utils.hexToBytes(extraData),
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
    let startIndex = endIndex - this.structure.claimType.length;
    // element 3 composition
    claimEntry.elements[3].fill(this.structure.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.structure.version.length;
    claimEntry.elements[3].fill(this.structure.version, startIndex, endIndex);
    // Get first part of the index
    let indexLen = this.structure.index.length;
    const firstSlotIndex = this.structure.index.slice(indexLen - 19, indexLen);
    endIndex = startIndex;
    startIndex = endIndex - firstSlotIndex.length;
    claimEntry.elements[3].fill(firstSlotIndex, startIndex, endIndex);

    // element 2 composition
    // Get second part of the index
    indexLen = this.structure.index.length - 19;
    const secondSlotIndex = this.structure.index.slice(0, indexLen);
    endIndex = claimEntry.elements[2].length;
    startIndex = endIndex - secondSlotIndex.length;
    claimEntry.elements[2].fill(secondSlotIndex, startIndex, endIndex);

    // element 1 composition
    // Get first part of the data
    indexLen = this.structure.extraData.length;
    const firstSlotExtra = this.structure.extraData.slice(indexLen - 31, indexLen);
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - firstSlotExtra.length;
    claimEntry.elements[1].fill(firstSlotExtra, startIndex, endIndex);

    // element 0 composition
    // Get second part of the data
    indexLen = this.structure.extraData.length - 31;
    const secondSlotExtra = this.structure.extraData.slice(0, indexLen);
    endIndex = claimEntry.elements[0].length;
    startIndex = claimEntry.elements[0].length - secondSlotExtra.length;
    claimEntry.elements[0].fill(secondSlotExtra, startIndex, endIndex);
    return claimEntry;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} entry - Entry of the claim
 * @returns {Object} SetRootKey class object
 */
function parseBasicClaim(entry) {
  const claim = new Basic({
    version: 0, index: '', extraData: '',
  });
  // Parse element 3 and element 2
  claim.structure.claimType = entry.elements[3].slice(24, 32);
  claim.structure.version = entry.elements[3].slice(20, 24);
  claim.structure.index = Buffer.concat([entry.elements[2].slice(1, 32), entry.elements[3].slice(1, 20)]);
  // Parse element 2 and element 1
  claim.structure.extraData = Buffer.concat([entry.elements[0].slice(1, 32), entry.elements[1].slice(1, 32)]);
  return claim;
}

module.exports = {
  Basic,
  parseBasicClaim,
};
