/**
 * @param  {String} keyRecover
 * @param  {String} keyRevoke
 * @param  {String} keyOp
 * @param  {Object} relay
 * @param  {String} implementation
 */
class Id {
  constructor(keyRecover, keyRevoke, keyOp, relay, relayAddr, implementation = '', backup=undefined) {
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOperational = keyOp;
    this.relay = relay;
    this.relayAddr = relayAddr; // this can be getted from a relay endpoint
    this.idaddr = undefined;
    this.implementation = implementation;
    this.backup = backup;
  }

  createID() {
    // send the data to Relay,and get the generated address of the counterfactual
    return this.relay.createID(this.keyOperational, this.keyRecover, this.keyRevoke).then((res) => {
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
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  genericClaim(kc, ksign, typeStr, extraIndexData, data) {
    const genericClaim = new claim.GenericClaim('namespace', typeStr, extraIndexData, data); // TODO namespace will be hardcoded in conf
    const signatureObj = kc.sign(kSign, genericClaim.hex());
    const bytesSignedMsg = {
      valueHex: genericClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: kSign
    };

    return this.relay.postClaim(this.idaddr, bytesSignedMsg).then(function(res) {
      this.backup.backupData(kc, this.idaddr, ksign, proofOfKSign, 'claim', authorizeKSignClaim.hex(), this.relayAddr);
      return res;
    });
  }

  /**
   * @param  {Object} kc
   * @param  {String} ksign
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  authorizeKSignClaim(kc, ksign, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    // TODO get proofOfKSign

    const authorizeKSignClaim = new claim.AuthorizeKSignClaim(keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
    const signatureObj = kc.sign(kSign, authorizeKSignClaim.hex());
    const bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      kSign
    };
    return this.relay.postClaim(this.idaddr, bytesSignedMsg).then(function(res) {
      const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c'; // TODO this will not be hardcoded
      this.backup.backupData(kc, this.idaddr, ksign, proofOfKSign, 'claim', authorizeKSignClaim.hex(), this.relayAddr);
      return res;
    });
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
