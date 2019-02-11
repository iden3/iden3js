import { Entry } from './entry/entry';

const utils = require('../utils');
const claimUtils = require('./claim-utils');
// const Entry = require('./entry/entry');
const CONSTANTS = require('../constants');
const assignNameClaim = require('./assign-name/assign-name');
const setRootKeyClaim = require('./set-root-key/set-root-key');
const authorizeKSignClaim = require('./authorize-ksign/authorize-ksign');
const authorizeKSignClaimSecp256k1 = require('./authorize-ksign-secp256k1/authorize-ksign-secp256k1');
const basicClaim = require('./basic/basic');

/**
 * Class to create new claims depending on its type
 */
class Factory {
  /**
   * @param {String} type - Claim to be created
   * @param {Object} data - Input parameters of the claim
   */
  constructor(type, data) {
    switch (type) {
      case CONSTANTS.CLAIMS.ASSIGN_NAME.ID:
        return new assignNameClaim.AssignName(data);
      case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN.ID:
        return new authorizeKSignClaim.AuthorizeKSign(data);
      case CONSTANTS.CLAIMS.BASIC.ID:
        return new basicClaim.Basic(data);
      case CONSTANTS.CLAIMS.SET_ROOT_KEY.ID:
        return new setRootKeyClaim.SetRootKey(data);
      case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.ID:
        return new authorizeKSignClaimSecp256k1.AuthorizeKSignSecp256k1(data);
      default:
        return undefined;
    }
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
function parseGenericClaimBytes(b) {
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
}

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
function parseAuthorizeKSignClaim(b) {
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
}

/**
 * @param  {Buffer} b
 * @returns {Buffer}
 */
function hiFromClaimBytes(b) {
  const indexLength = utils.ethBytesToUint32(b.slice(56, 60));
  return utils.hashBytes(b.slice(0, indexLength));
}

module.exports = {
  claimUtils,
  Entry,
  Factory,
  GenericClaim,
  parseGenericClaimBytes,
  AuthorizeKSignClaim,
  parseAuthorizeKSignClaim,
  hiFromClaimBytes,
};
