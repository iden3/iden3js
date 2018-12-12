const claim = require('../claim/claim');

/**
 * @param  {String} keyRecover
 * @param  {String} keyRevoke
 * @param  {String} keyOp
 * @param  {Object} relay
 * @param  {String} implementation
 */
class Id {
  constructor(keyRecover, keyRevoke, keyOp, relay, relayAddr, implementation = '', backup = undefined) {
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOperational = keyOp;
    this.relay = relay;
    this.relayAddr = relayAddr; // this can be get from a relay endpoint
    this.idAddr = undefined;
    this.implementation = implementation;
    this.backup = backup;
  }

  createID() {
    // send the data to Relay,and get the generated address of the counterfactual
    return this.relay.createID(this.keyOperational, this.keyRecover, this.keyRevoke)
      .then((res) => {
        this.idAddr = res.data.idaddr;
        return this.idAddr;
      });
  }

  deployID() {
    return this.relay.deployID(this.idAddr);
  }

  /**
   * @param  {Object} kc
   * @param  {String} kSign
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  genericClaim(kc, kSign, proofOfKSign, typeStr, extraIndexData, data) {
    const genericClaim = new claim.GenericClaim('namespace', typeStr, extraIndexData, data); // TODO namespace will be hardcoded in conf
    const signatureObj = kc.sign(kSign, genericClaim.hex());
    const bytesSignedMsg = {
      valueHex: genericClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: kSign,
    };

    const self = this;
    return this.relay.postClaim(this.idAddr, bytesSignedMsg)
      .then((res) => {
        if ((self.backup !== undefined) && (proofOfKSign !== undefined)) {
          self.backup.backupData(kc, self.idAddr, kSign, proofOfKSign, 'claim', genericClaim.hex(), self.relayAddr);
        }
        return res;
      });
  }

  /**
   * @param  {Object} kc
   * @param  {String} kSign
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  authorizeKSignClaim(kc, kSign, proofOfKSign, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    // TODO get proofOfKSign

    const authorizeKSignClaim = new claim.AuthorizeKSignClaim(keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
    const signatureObj = kc.sign(kSign, authorizeKSignClaim.hex());
    const bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      kSign,
    };
    const self = this;
    return this.relay.postClaim(this.idAddr, bytesSignedMsg)
      .then((res) => {
        if ((self.backup !== undefined) && (proofOfKSign !== undefined)) {
          self.backup.backupData(kc, self.idAddr, kSign, proofOfKSign, 'claim', authorizeKSignClaim.hex(), self.relayAddr);
        }
        return res;
      });
  }

  /**
   * @param  {Object} kc
   * @param  {String} name
   */
  bindID(kc, name) {
    return this.relay.bindID(kc, this.idAddr, this.keyOperational, name);
  }
}

module.exports = Id;
