const Claim = require('../claim');
const utils = require('../../utils');

/**
 * @param  {Uint32} Version
 * @param  {String} Index
 * @param  {String} Data
 */
class Basic {
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
   * @returns {Object Elements} Element representation of the claim
   */
  elements() {
    const element = new Claim.Elements();
    let endIndex = element.e3.length;
    let startIndex = endIndex - this.structure.claimType.length;
    // e3 element composition
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

    // e2 element composition
    // Get second part of the index
    indexLen = this.structure.index.length - 19;
    const secondSlotIndex = this.structure.index.slice(0, indexLen);
    endIndex = element.e2.length;
    startIndex = endIndex - secondSlotIndex.length;
    element.e2.fill(secondSlotIndex, startIndex, endIndex);

    // e1 element composition
    // Get first part of the index
    indexLen = this.structure.data.length;
    const firstSlotExtra = this.structure.data.slice(indexLen - 31, indexLen);
    endIndex = element.e1.length;
    startIndex = element.e1.length - firstSlotExtra.length;
    element.e1.fill(firstSlotExtra, startIndex, endIndex);

    // e0 remains as empty value
    // Get second part of the index
    indexLen = this.structure.data.length - 31;
    const secondSlotExtra = this.structure.data.slice(0, indexLen);
    endIndex = element.e0.length;
    startIndex = element.e0.length - secondSlotExtra.length;
    element.e0.fill(secondSlotExtra, startIndex, endIndex);
    return element;
  }
}

/**
 * @param  {Object Elements} Representation of the claim
 * @returns {Claim class} Claim object
 */
const parseFromElements = function (elements) {
  const claim = new Basic();
  // Parse e3 and e2
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  claim.structure.index = Buffer.concat([elements.e2.slice(1, 32), elements.e3.slice(1, 20)]);
  // Parse e2 and e1
  claim.structure.data = Buffer.concat([elements.e0.slice(1, 32), elements.e1.slice(1, 32)]);
  return claim;
};

module.exports = {
  Basic,
  parseFromElements,
};
