const Claim = require('../claim');
const utils = require('../../utils');

class SetRootKey extends Claim.Claim {
  constructor(version = '', era = '', id = '', rootKey = '') {
    super();
    this.structure = {
      e3: {
        claimtype: utils.hashBytes('iden3claim.setRootKey').slice(24, 32),
        version,
        era,
      },
      e2: id,
      e1: rootKey,
      e0: null,
    };
  }
}

const parserSetRootKeyClaim = function (bytesClaim) {
  const claim = new SetRootKey();
  
  claim.structure = {
    e3: {
      claimtype = bytesClaim.slice(0, 8),
      version = bytesClaim.slice(8, ),
      era = bytesClaim.slice(8, ),
    },
    e2: id,
    e1: rootKey,
    e0: null,
  };
  
  return claim;
};

module.exports = {
  SetRootKey,
  parserSetRootKeyClaim,
};
