const Claim = require('../claim');
const utils = require('../../utils');

/**
 * Class representing a set root key claim
 * Set root key claim is used to commit a root of a merkle by a given identity
 * Assign name element representation is as follows:
 * |element 3|: |empty|era|version|claim type| - |16 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |12 bytes|20 bytes|
 * |element 1|: |root key| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class SetRootKey {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {Uint32} _era - Era assigned to the claim
   * @param {String} _id - Identity bind to the hash name
   * @param {String} _rootKey - Root key to commit
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
