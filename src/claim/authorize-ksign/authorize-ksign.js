const Claim = require('../claim');
const utils = require('../../utils');

/**
 * Class representing an authorized Ksign claim
 * Authorized Ksign claim is used to authorize a key for being used afterwards
 * Authorized Ksign element representation is as follows:
 * |element 3|: |empty|Ax|sign|version|claim type| - |3 bytes|16 bytes|1 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|Ay| - |16 bytes|16 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
class AuthorizeKSign {
  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is a string used to define this concrete claim. Last 8 bytes of its hash are taken
   * @param {Uint32} _version - Version assigned to the claim
   * @param {Bool} _sign - Sign of the coordinate X of an eliptic curve point
   * @param {String} _ax - Coordinate X of an eliptic curve point
   * @param {String} _ay - Coordinate Y of an eliptic curve point
   */
  constructor(_version = 0, _ax = '', _ay = '', _sign = false) {
    const versionBuff = Buffer.alloc(4);
    const signeBuff = Buffer.alloc(1);
    signeBuff.writeUInt8(_sign);
    versionBuff.writeUInt32BE(_version);
    this.structure = {
      claimType: utils.hashBytes('iden3.claim.authorize_k_sign').slice(24, 32),
      version: versionBuff,
      signe: signeBuff,
      ax: utils.hexToBytes(_ax),
      ay: utils.hexToBytes(_ay),
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
    endIndex = startIndex;
    startIndex = endIndex - this.structure.sign.length;
    element.e3.fill(this.structure.sign, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.structure.ax.length;
    element.e3.fill(this.structure.ax, startIndex, endIndex);
    // claim element 2 composition
    endIndex = element.e2.length;
    startIndex = element.e2.length - this.structure.ay.length;
    element.e2.fill(this.structure.ay, startIndex, endIndex);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return element;
  }
}

/**
 * Decode field claim structure into raw data claim structure
 * @param  {Object} elements - Element representation of the claim
 * @returns {Object} AuthorizeKSign class object
 */
function parseFromElements(elements) {
  const claim = new AuthorizeKSign();
  // Parse element 3
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  claim.structure.signe = elements.e3.slice(19, 20);
  claim.structure.ax = elements.e3.slice(3, 19);
  // Parse element 2
  claim.structure.ay = elements.e2.slice(16, 32);
  return claim;
}

module.exports = {
  AuthorizeKSign,
  parseFromElements,
};
