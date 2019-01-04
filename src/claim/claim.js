const snarkjs = require('snarkjs');
const merkleTree = require('../merkle-tree/merkle-tree');
const utils = require('../utils');
const CONSTANTS = require('../constants');
const mimc7 = require('../sparse-merkle-tree/mimc7');
const helpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');

const { bigInt } = snarkjs;

class Elements {
  constructor() {
    this.e0 = Buffer.alloc(32);
    this.e1 = Buffer.alloc(32);
    this.e2 = Buffer.alloc(32);
    this.e3 = Buffer.alloc(32);
  }

  hi() {
    const hashArray = [this.e2, this.e3];
    const hashKey = mimc7.smtHash(hashArray);
    return helpers.bigIntToBuffer(hashKey);
  }

  hv() {
    const hashArray = [this.e0, this.e1];
    const hashKey = mimc7.smtHash(hashArray);
    return helpers.bigIntToBuffer(hashKey);
  }

  bytes() {
    const concat = [this.e0, this.e1, this.e2, this.e3];
    return utils.bytesToHex(Buffer.concat(concat));
  }
}
/**
 * @param  {String} namespaceStr
 * @param  {String} typeStr
 * @param  {String} data
 * @returns  {Object} claim
 */
class GenericClaim {
  constructor(namespaceStr = 'iden3.io', typeStr = 'default', extraIndexData = '', data = '') {
    this.claim = {
      baseIndex: {
        namespace: utils.hashBytes(Buffer.from(namespaceStr)),
        type: utils.hashBytes(Buffer.from(typeStr)).slice(0, 24),
        indexLength: 64 + Buffer.from(extraIndexData).length,
        version: 0,
      },
      extraIndex: {
        data: Buffer.from(extraIndexData),
      },
      data: Buffer.from(data),
    };
  }

  bytes() {
    let b = Buffer.from([]);
    b = Buffer.concat([b, this.claim.baseIndex.namespace]);
    b = Buffer.concat([b, this.claim.baseIndex.type]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.indexLength),
    ]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.version),
    ]);
    b = Buffer.concat([b, this.claim.extraIndex.data]);
    b = Buffer.concat([b, this.claim.data]);
    return b;
  }

  hex() {
    return utils.bytesToHex(this.bytes());
  }

  hi() {
    return utils.hashBytes(this.bytes().slice(0, this.claim.baseIndex.indexLength));
  }

  ht() {
    return utils.hashBytes(this.bytes());
  }
}

/**
 * @param  {Buffer} bytes
 * @returns  {Object} claim
 */
const parseGenericClaimBytes = function (b) {
  const c = new GenericClaim();
  c.claim = {
    baseIndex: {
      namespace: b.slice(0, 32),
      type: b.slice(32, 56),
      indexLength: utils.ethBytesToUint32(b.slice(56, 60)),
      version: utils.ethBytesToUint32(b.slice(60, 64)),
    },
    extraIndex: {
      data: b.slice(64, utils.ethBytesToUint32(b.slice(56, 60))),
    },
    data: b.slice(utils.ethBytesToUint32(b.slice(56, 60)), b.length),
  };
  return c;
};

/**
 * @param  {String} namespaceStr
 * @param  {String} keyToAuthorize
 * @param  {String} applicationName
 * @param  {String} applicationAuthz
 * @param  {Number} validFrom
 * @param  {Number} validUntil
 * @returns {Object} claim
 */
class AuthorizeKSignClaim {
  constructor(keyToAuthorize = '', applicationName = '', applicationAuthz = '', validFrom = '', validUntil = '') {
    this.claim = {
      baseIndex: {
        namespace: CONSTANTS.NAMESPACEHASH,
        type: utils.hashBytes(Buffer.from('authorizeksign')).slice(0, 24),
        indexLength: 84,
        version: 0,
      },
      extraIndex: {
        keyToAuthorize,
      },
      application: utils.hashBytes(Buffer.from(applicationName)),
      applicationAuthz: utils.hashBytes(Buffer.from(applicationAuthz)),
      validFrom,
      validUntil,
    };
  }

  bytes() {
    let b = Buffer.from([]);
    b = Buffer.concat([b, this.claim.baseIndex.namespace]);
    b = Buffer.concat([b, this.claim.baseIndex.type]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.indexLength),
    ]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.version),
    ]);
    b = Buffer.concat([
      b,
      utils.hexToBytes(this.claim.extraIndex.keyToAuthorize),
    ]);
    b = Buffer.concat([b, this.claim.application]);
    b = Buffer.concat([b, this.claim.applicationAuthz]);
    const validFromBuf = utils.uint64ToEthBytes(this.claim.validFrom);
    b = Buffer.concat([b, validFromBuf]);
    const validUntilBuf = utils.uint64ToEthBytes(this.claim.validUntil);
    b = Buffer.concat([b, validUntilBuf]);
    return b;
  }

  hex() {
    return utils.bytesToHex(this.bytes());
  }

  hi() {
    return utils.hashBytes(this.bytes().slice(0, this.claim.baseIndex.indexLength));
  }

  ht() {
    return utils.hashBytes(this.bytes());
  }
}

/**
 * @param  {Buffer} b - bytes
 * @returns {Object} claim
 */
const parseAuthorizeKSignClaim = function (b) {
  const validFromBytes = b.slice(148, 156);
  const validFrom = utils.ethBytesToUint64(validFromBytes);
  const validUntilBytes = b.slice(156, 164);
  const validUntil = utils.ethBytesToUint64(validUntilBytes);
  const c = new AuthorizeKSignClaim();

  c.claim = {
    baseIndex: {
      namespace: b.slice(0, 32),
      type: b.slice(32, 56),
      indexLength: utils.ethBytesToUint32(b.slice(56, 60)),
      version: utils.ethBytesToUint32(b.slice(60, 64)),
    },
    extraIndex: {
      keyToAuthorize: utils.bytesToHex(b.slice(64, 84)),
    },
    application: b.slice(84, 116),
    applicationAuthz: b.slice(116, 148),
    validFrom,
    validUntil,
  };

  return c;
};

/**
 * @param  {Buffer} b
 * @returns {Buffer}
 */
const hiFromClaimBytes = function (b) {
  const indexLength = utils.ethBytesToUint32(b.slice(56, 60));
  return utils.hashBytes(b.slice(0, indexLength));
};

/**
 * @param  {Object} proofOfClaim
 * @param  {Number} numLevels
 * @returns {Boolean}
 */
const checkProofOfClaim = function (proofOfClaim, numLevels) {
  let ht = utils.bytesToHex(utils.hashBytes(utils.hexToBytes(proofOfClaim.ClaimProof.Leaf)));
  let hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.ClaimProof.Leaf)));
  const vClaimProof = merkleTree.checkProof(proofOfClaim.ClaimProof.Root, proofOfClaim.ClaimProof.Proof, hi, ht, numLevels);

  ht = utils.bytesToHex(utils.hashBytes(utils.hexToBytes(proofOfClaim.SetRootClaimProof.Leaf)));
  hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.SetRootClaimProof.Leaf)));
  const vSetRootClaimProof = merkleTree.checkProof(proofOfClaim.SetRootClaimProof.Root,
    proofOfClaim.SetRootClaimProof.Proof, hi, ht, numLevels);

  ht = utils.bytesToHex(merkleTree.emptyNodeValue);
  hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.ClaimNonRevocationProof.Leaf)));
  const vClaimNonRevocationProof = merkleTree.checkProof(proofOfClaim.ClaimNonRevocationProof.Root,
    proofOfClaim.ClaimNonRevocationProof.Proof, hi, ht, numLevels);

  hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.SetRootClaimNonRevocationProof.Leaf)));
  const vSetRootClaimNonRevocationProof = merkleTree.checkProof(proofOfClaim.SetRootClaimNonRevocationProof.Root,
    proofOfClaim.SetRootClaimNonRevocationProof.Proof, hi, ht, numLevels);

  return !!(vClaimProof && vSetRootClaimProof && vClaimNonRevocationProof && vSetRootClaimNonRevocationProof);
};

module.exports = {
  Elements,
  GenericClaim,
  parseGenericClaimBytes,
  AuthorizeKSignClaim,
  parseAuthorizeKSignClaim,
  hiFromClaimBytes,
  checkProofOfClaim,
};
