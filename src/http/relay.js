const axios = require('axios');
const claim = require('../core/claim');
const utils = require('../utils');

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
    return axios.get(`${this.url}/root`);
  }

  /**
   * @param {String} - ID Address
   * @returns {Object}
   */
  getIDRoot(idAddr) {
    return axios.get(`${this.url}/claim/${idAddr}/root`);
  }

  /**
   * @param  {String} idAddr - ID Address
   * @param {Object} bytesSignedMsg
   * @returns {Object}
   */
  postClaim(idAddr, bytesSignedMsg) {
    return axios.post(`${this.url}/claim/${idAddr}`, bytesSignedMsg);
  }

  /**
   * @param  {String} idAddr
   * @param  {String} hi, Hash(index)
   * @returns {Object}
   */
  getClaimByHi(idAddr, hi) {
    return axios.get(`${this.url}/claim/${idAddr}/hi/${hi}`);
  }

  /**
   * @param  {Object} kc
   * @param  {String} idaddr
   * @param  {String} ksign
   * @param  {String} namespaceStr
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  claimDefault(kc, idAddr, kSign, namespaceStr, typeStr, extraIndexData, data) {
    const claimDefault = new claim.ClaimDefault(namespaceStr, typeStr, extraIndexData, data);
    const signatureObj = kc.sign(kSign, claimDefault.hex());
    const bytesSignedMsg = {
      valueHex: claimDefault.hex(),
      signatureHex: signatureObj.signature,
      ksign: kSign,
    };

    return this.postClaim(idAddr, bytesSignedMsg);
  }

  /**
   * @param  {Object} kc
   * @param  {String} idaddr
   * @param  {String} ksign
   * @param  {String} namespaceStr
   * @param  {String} keyToAuthorize
   * @param  {String} applicationName
   * @param  {String} applicationAuthz
   * @param  {Number} validFrom
   * @param  {Number} validUntil
   * @returns {Object}
   */
  authorizeKSignClaim(kc,
    idAddr,
    kSign,
    namespaceStr,
    keyToAuthorize,
    applicationName,
    applicationAuthz,
    validFrom,
    validUntil) {
    const authorizeKSignClaim = new claim.AuthorizeKSignClaim(
      namespaceStr,
      keyToAuthorize,
      applicationName,
      applicationAuthz,
      validFrom,
      validUntil,
    );
    const signatureObj = kc.sign(kSign, authorizeKSignClaim.hex());
    const bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      kSign,
    };
    return this.postClaim(idAddr, bytesSignedMsg);
  }

  /**
   * @param  {String} idaddr
   * @param {String} name
   * @param {String} signature
   * @returns {Object}
   */
  postBindID(bindIDMsg) {
    return axios.post(`${this.url}/vinculateid`, bindIDMsg);
  }

  /**
   * @param  {Object} kc - Keycontainer
   * @param  {String} idaddr
   * @param  {String} keyOperational
   * @param  {String} name
   */
  bindID(kc, idAddr, keyOperational, name) {
    const idBytes = utils.hexToBytes(idAddr);
    const nameBytes = Buffer.from(name);
    let msgBytes = Buffer.from([]);

    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    const signatureObj = kc.sign(keyOperational, utils.bytesToHex(msgBytes));
    const bindIDMsg = {
      ethID: idAddr,
      name,
      signature: signatureObj.signature, // for the moment, signature(idaddr+name)
      ksign: keyOperational,
    };
    return this.postBindID(bindIDMsg);
  }

  /**
   * @param  {String} name
   */
  resolveName(name) {
    return axios.get(`${this.url}/identities/resolv/${name}`);
  }

  /**
   * @param  {String} op
   * @param  {String} rec
   * @param  {String} rev
   */
  createID(op, rec, rev) {
    const keys = {
      operational: op,
      recoverer: rec,
      revokator: rev,
    };
    return axios.post(`${this.url}/id`, keys);
  }

  /**
   * @param  {String} idaddr
   */
  getID(idaddr) {
    return axios.get(`${this.url}/id/${idaddr}`);
  }

  /**
   * @param  {String} idaddr
   */
  deployID(idaddr) {
    return axios.post(`${this.url}/id/${idaddr}/deploy`);
  }
}

module.exports = Relay;
