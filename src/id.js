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
    // TODO send the data to Relay,and get the generated address of the counterfactual
    this.address = keyOp; // tmp
  }

  /**
   * @param  {Object} kc
   * @param  {String} ksign
   * @param  {Object} proofOfKSign
   * @param  {String} namespaceStr
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  ClaimDefault(kc, ksign, proofOfKSign, namespaceStr, typeStr, extraIndexData, data) {
    return this.relay.ClaimDefault(kc, this.address, ksign, proofOfKSign, namespaceStr, typeStr, extraIndexData, data);
  }

  /**
   * @param  {Object} kc
   * @param  {String} ksign
   * @param  {String} namespaceStr
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  AuthorizeKSignClaim(kc, ksign, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    return this.relay.AuthorizeKSignClaim(kc, this.address, ksign, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
  }

 vinculateID(kc, keyid, name) {
   return this.relay.vinculateID(kc, keyid, name);
 }
}
module.exports = Id;
