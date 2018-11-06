/**
 * @param  {String} keyRecover
 * @param  {String} keyRevoke
 * @param  {String} keyOp
 * @param  {Object} relay
 * @param  {String} implementation
 */
class Id {
  constructor(keyRecover, keyRevoke, keyOp, relay, implementation = '') {
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOperational = keyOp;
    this.relay = relay;
    this.idaddr = undefined;
    this.implementation = implementation;
  }

  createID() {
    // send the data to Relay,and get the generated address of the counterfactual
    return this.relay.createID(this.keyOperational, this.keyRecover, this.keyRevoke)
      .then((res) => {
        this.idaddr = res.data.idaddr;
        return this.idaddr;
      });
  }

  deployID() {
    return this.relay.deployID(this.idaddr);
  }

  /**
   * @param  {Object} kc
   * @param  {String} ksign
   * @param  {String} namespaceStr
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  claimDefault(kc, ksign, namespaceStr, typeStr, extraIndexData, data) {
    return this.relay.claimDefault(kc, this.idaddr, ksign, namespaceStr, typeStr, extraIndexData, data);
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
  authorizeKSignClaim(kc, ksign, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    return this.relay.authorizeKSignClaim(
      kc,
      this.idaddr,
      ksign,
      namespaceStr,
      keyToAuthorize,
      applicationName,
      applicationAuthz,
      validFrom,
      validUntil,
    );
  }

  /**
   * @param  {Object} kc
   * @param  {String} name
   */
  bindID(kc, name) {
    return this.relay.bindID(kc, this.idaddr, this.keyOperational, name);
  }
}

module.exports = Id;
