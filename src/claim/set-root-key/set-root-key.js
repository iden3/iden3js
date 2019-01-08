const Claim = require('../claim');
const utils = require('../../utils');

/**
 * @param  {Uint32} Version
 * @param  {Uint32} Era
 * @param  {String} Address identifier
 * @param  {String} Root
 */
class SetRootKey {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {*} _version 
   * @param {*} _era 
   * @param {*} _id 
   * @param {*} _rootKey 
   */
  constructor(_version = 0, _era = 0, _id = '', _rootKey = '') {
    const versionBuff = Buffer.alloc(4);
    const eraBuff = Buffer.alloc(4);
    eraBuff.writeUInt32BE(_era);
    versionBuff.writeUInt32BE(_version);
    this.structure = {
      claimType: utils.hashBytes('iden3.claim.set_root_key').slice(24, 32),
      version: versionBuff,
      era: eraBuff,
      id: utils.hexToBytes(_id),
      rootKey: utils.hexToBytes(_rootKey),
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
    endIndex = startIndex;
    startIndex = endIndex - this.structure.era.length;
    element.e3.fill(this.structure.era, startIndex, endIndex);
    // element 2 composition
    endIndex = element.e2.length;
    startIndex = element.e2.length - this.structure.id.length;
    element.e2.fill(this.structure.id, startIndex, endIndex);
    // element 1 composition
    endIndex = element.e1.length;
    startIndex = element.e1.length - this.structure.rootKey.length;
    element.e1.fill(this.structure.rootKey, startIndex, endIndex);
    // element 0 remains as empty value
    return element;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} elements - Element representation of the claim
 * @returns {Object} SetRootKey class object
 */
function parseFromElements(elements) {
  const claim = new SetRootKey();
  // Parse element 3
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  claim.structure.era = elements.e3.slice(16, 20);
  // Parse element 2
  claim.structure.id = elements.e2.slice(12, 32);
  // Parse element 1
  claim.structure.rootKey = elements.e1;
  return claim;
}

module.exports = {
  SetRootKey,
  parseFromElements,
};
