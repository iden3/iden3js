const Claim = require('../claim');
const utils = require('../../utils');

/**
 * Class representing an assign name claim
 * Assign name claim is used to bind an identity addres with a human readable text
 * Assign name element representation ias as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |32 bytes|
 * |element 1|: |empty|identity| - |12 bytes|20 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class AssignName {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {String} _hashName - Hash regarding human readable text
   * @param {String} _id - Identity bind to the hash name
   */
  constructor(_version = 0, _hashName = '', _id = '') {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(_version);
    this.structure = {
      claimType: utils.hashBytes('iden3.claim.assign_name').slice(24, 32),
      version: versionBuff,
      hashName: utils.hashBytes(_hashName).fill(0, 0, 1),
      id: utils.hexToBytes(_id),
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
    // claim element 3 composition
    element.e3.fill(this.structure.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.structure.version.length;
    element.e3.fill(this.structure.version, startIndex, endIndex);
    // claim element 2 composition
    endIndex = element.e2.length;
    startIndex = element.e2.length - this.structure.hashName.length;
    element.e2.fill(this.structure.hashName, startIndex, endIndex);
    // claim element 1 composition
    endIndex = element.e1.length;
    startIndex = element.e1.length - this.structure.id.length;
    element.e1.fill(this.structure.id, startIndex, endIndex);
    // claim element 0 remains as empty value
    return element;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} elements - Element representation of the claim
 * @returns {Object} AssignName class object
 */
function parseFromElements(elements) {
  const claim = new AssignName();
  // Parse element 3
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  // Parse element 2
  claim.structure.hashName = elements.e2.slice(0, 32);
  // Parse element 1
  claim.structure.id = elements.e1.slice(12, 32);
  return claim;
}

module.exports = {
  AssignName,
  parseFromElements,
};
