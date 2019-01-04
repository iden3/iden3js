const Claim = require('../claim');
const utils = require('../../utils');

/**
 * @param  {Uint32} Version
 * @param  {Uint32} Era
 * @param  {String} Address identifier
 * @param  {String} Root
 */
class AuthorizeKSign {
  constructor(_version = 0, _signe = false, _ax = '', _ay = '') {
    const versionBuff = Buffer.alloc(4);
    const signeBuff = Buffer.alloc(1);
    signeBuff.writeUInt8(_signe);
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
    endIndex = startIndex;
    startIndex = endIndex - this.structure.signe.length;
    element.e3.fill(this.structure.signe, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.structure.ax.length;
    element.e3.fill(this.structure.ax, startIndex, endIndex);
    // e2 element composition
    endIndex = element.e2.length;
    startIndex = element.e2.length - this.structure.ay.length;
    element.e2.fill(this.structure.ay, startIndex, endIndex);
    // e1 remains as empty value
    // e0 remains as empty value
    return element;
  }
}

const parseFromElements = function (elements) {
  const claim = new AuthorizeKSign();
  // Parse e3
  claim.structure.claimType = elements.e3.slice(24, 32);
  claim.structure.version = elements.e3.slice(20, 24);
  claim.structure.signe = elements.e3.slice(19, 20);
  claim.structure.ax = elements.e3.slice(3, 19);
  // Parse e2
  claim.structure.ay = elements.e2.slice(16, 32);
  return claim;
};

module.exports = {
  AuthorizeKSign,
  parseFromElements,
};
