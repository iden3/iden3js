const Claim = require('../claim');
const utils = require('../../utils');

/**
 * @param  {Uint32} Version
 * @param  {Uint32} Era
 * @param  {String} Address identifier
 * @param  {String} Root
 */
class AssignName {
  constructor(_version = 0, _hashName = '', _id = '') {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(_version);
    this.structure = {
      claimType: utils.hashBytes('iden3.claim.assign_name').slice(24, 32),
      version: versionBuff,
      hashName: utils.hashBytes(_hashName),
      id: utils.hexToBytes(_id),
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
    // e2 element composition
    endIndex = element.e2.length;
    startIndex = element.e2.length - this.structure.hashName.length;
    element.e2.fill(this.structure.hashName, startIndex, endIndex);
    // e1 element composition
    endIndex = element.e1.length;
    startIndex = element.e1.length - this.structure.id.length;
    element.e1.fill(this.structure.id, startIndex, endIndex);
    // e0 remains as empty value
    return element;
  }
}

const parseFromElements = function (elements) {
  const claim = new AssignName();
  // Parse e3
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  // Parse e2
  claim.structure.hashName = elements.e2.slice(0, 32);
  // Parse e1
  claim.structure.id = elements.e1.slice(12, 32);
  return claim;
};

module.exports = {
  AssignName,
  parseFromElements,
};
