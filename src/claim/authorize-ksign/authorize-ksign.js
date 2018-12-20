const utils = require('../../utils/utils');
const CONSTANTS = require('../../constants');

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
        namespace: CONSTANTS.NAMESPACE_HASH,
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

module.exports = AuthorizeKSignClaim;
