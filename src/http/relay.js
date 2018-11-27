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
      ksign: keyOperational
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
      revokator: rev
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
