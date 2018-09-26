const claim = require('./core/claim');

/**
 * @param  {String} keyRecover
 * @param  {String} keyRevoke
 * @param  {String} keyOp
 * @param  {Obj} relay
 * @param  {String} implementation
 */
class Id {
  constructor(keyRecover, keyRevoke, keyOp, relay, implementation) {
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOp = keyOp;
    this.relay = relay;
    this.implementation = implementation;
  }

  /**
   * @param  {Object} kc
   * @param  {String} keyid
   * @param  {String} namespaceStr
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  ClaimDefault(kc, keyid, namespaceStr, typeStr, extraIndexData, data) {
    return this.relay.ClaimDefault(kc, keyid, namespaceStr, typeStr, extraIndexData, data);
  }

  /**
   * @param  {Object} kc
   * @param  {String} keyid
   * @param  {String} namespaceStr
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  AuthorizeKSignClaim(kc, keyid, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    return this.relay.AuthorizeKSignClaim(kc, keyid, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
  }
}
module.exports = Id;
