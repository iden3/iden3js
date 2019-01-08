const Claim = require('../claim');
const utils = require('../../utils');

/**
 * Class representing a basic claim
 * Basic claim is used to issue generic data
 * Index and Data are split into two fields to fit claim element data structure
 * Basic element representation is as follows:
 * |element 3|: |empty|index[0]|version|claim type| - |1 byte|19 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|index[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty|data[0]| - |1 bytes|31 bytes|
 * |element 0|: |empty|data[1]| - |1 bytes|31 bytes|
 */
class Basic {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {String} _index - Generic index data
   * @param {String} _data - Generic data
   */
  constructor(_version = 0, _index = '', _data = '') {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(_version);
    this.structure = {
      claimType: utils.hashBytes('iden3.claim.basic').slice(24, 32),
      version: versionBuff,
      index: utils.hexToBytes(_index),
      data: utils.hexToBytes(_data),
    };
  }

  /**
   * Code raw data claim structure into an element claim structure
   * @returns {Object} Element representation of the claim
   */
  elements() {
    const element = new Claim.Elements();
    let endIndex = element.e3.length;
    let startIndex = endIndex - this.structure.claimType.length;
    // element 3 composition
    element.e3.fill(this.structure.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.structure.version.length;
    element.e3.fill(this.structure.version, startIndex, endIndex);
    // Get first part of the index
    let indexLen = this.structure.index.length;
    const firstSlotIndex = this.structure.index.slice(indexLen - 19, indexLen);
    endIndex = startIndex;
    startIndex = endIndex - firstSlotIndex.length;
    element.e3.fill(firstSlotIndex, startIndex, endIndex);

    // element 2 composition
    // Get second part of the index
    indexLen = this.structure.index.length - 19;
    const secondSlotIndex = this.structure.index.slice(0, indexLen);
    endIndex = element.e2.length;
    startIndex = endIndex - secondSlotIndex.length;
    element.e2.fill(secondSlotIndex, startIndex, endIndex);

    // element 1 composition
    // Get first part of the data
    indexLen = this.structure.data.length;
    const firstSlotExtra = this.structure.data.slice(indexLen - 31, indexLen);
    endIndex = element.e1.length;
    startIndex = element.e1.length - firstSlotExtra.length;
    element.e1.fill(firstSlotExtra, startIndex, endIndex);

    // element 0 composition
    // Get second part of the data
    indexLen = this.structure.data.length - 31;
    const secondSlotExtra = this.structure.data.slice(0, indexLen);
    endIndex = element.e0.length;
    startIndex = element.e0.length - secondSlotExtra.length;
    element.e0.fill(secondSlotExtra, startIndex, endIndex);
    return element;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} elements - Element representation of the claim
 * @returns {Object} SetRootKey class object
 */
function parseFromElements(elements) {
  const claim = new Basic();
  // Parse element 3 and element 2
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  claim.structure.index = Buffer.concat([elements.e2.slice(1, 32), elements.e3.slice(1, 20)]);
  // Parse element 2 and element 1
  claim.structure.data = Buffer.concat([elements.e0.slice(1, 32), elements.e1.slice(1, 32)]);
  return claim;
}

module.exports = {
  Basic,
  parseFromElements,
};
