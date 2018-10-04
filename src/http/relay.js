const axios = require('axios');
const claim = require('../core/claim');

/**
 * @param  {String} url
 */
class Relay {
  constructor(url) {
    this.url = url;
  }

  /**
   * @returns {Object}
   */
  getRelayRoot() {
    return axios.get(this.url + '/root')
  }

  /**
   * @param {String} - ID Address
   * @returns {Object}
   */
  getIDRoot(idaddr) {
    return axios.get(this.url + '/claim/' + idaddr + '/root')
  }

  /**
   * @param  {String} - ID Address
   * @param {Object} claim
   * @returns {Object}
   */
  postClaim(idaddr, claim) {
    return axios.post(this.url + '/claim/' + idaddr, claim);

  }

  /**
   * @param  {String} idaddr
   * @param  {String} hi, Hash(index)
   * @returns {Object}
   */
  getClaimByHi(idaddr, hi) {
    return axios.get(this.url + '/claim/' + idaddr + '/hi/' + hi);
  }

  /**
   * @param  {Object} kc
   * @param  {String} idaddr
   * @param  {String} ksign
   * @param  {Object} proofOfKSign
   * @param  {String} namespaceStr
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  ClaimDefault(kc, idaddr, ksign, proofOfKSign, namespaceStr, typeStr, extraIndexData, data) {
    let claimDefault = new claim.ClaimDefault(namespaceStr, typeStr, extraIndexData, data);
    let signatureObj = kc.sign(ksign, claimDefault.hex());
    let bytesSignedMsg = {
      valueHex: claimDefault.hex(),
      signatureHex: signatureObj.signature,
      ksign: ksign,
      proofOfKSign: proofOfKSign
    };
    return this.postClaim(idaddr, bytesSignedMsg);
  }

  /**
   * @param  {Object} kc
   * @param  {String} idaddr
   * @param  {String} keyid
   * @param  {String} namespaceStr
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  AuthorizeKSignClaim(kc, idaddr, ksign, namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    let authorizeKSignClaim = new claim.AuthorizeKSignClaim(namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
    let signatureObj = kc.sign(ksign, authorizeKSignClaim.hex());
    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: ksign // TODO proofOfKSign, how from the counterfactual
    };
    return this.postClaim(idaddr, bytesSignedMsg);
  }
}

module.exports = Relay;
