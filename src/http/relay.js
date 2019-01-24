const axios = require('axios');
const utils = require('../utils');

/**
 * Class representing a the Relay
 * It contains all the relay API calls
 * @param {String} url
 */
class Relay {
  /**
   * Initialization relay object
   * @param {String} url - Relay Url identifier
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * Retrieve the merkle tree root of the relay
   * @returns {Object} - Http response
   */
  getRelayRoot() {
    return axios.get(`${this.url}/root`);
  }

  /**
   * Retrieve the merkle tree root of the given identity merkle tree
   * @param {String} isAddr - Identity address
   * @returns {Object} - Http response
   */
  getIDRoot(idAddr) {
    return axios.get(`${this.url}/claim/${idAddr}/root`);
  }

  /**
   * Add a claim into the identity merkle tree
   * @param {String} idAddr - Identity address
   * @param {Object} bytesSignedMsg - Data necessary to create the claim: { claim data, signature, key sign }
   * @returns {Object} - Http response
   */
  postClaim(idAddr, bytesSignedMsg) {
    return axios.post(`${this.url}/claim/${idAddr}`, bytesSignedMsg);
  }

  /**
   * Retrieve claim data from identity merkle tree
   * @param  {String} idAddr - Identity address
   * @param  {String} hi - Claim index hash
   * @returns {Object} - Http response
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
   * @param  {String} keyOperationalPub
   * @param  {String} name
   */
  bindID(kc, idAddr, keyOperationalPub, name) {
    const idBytes = utils.hexToBytes(idAddr);
    const nameBytes = Buffer.from(name);
    let msgBytes = Buffer.from([]);

    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    const signatureObj = kc.sign(keyOperationalPub, utils.bytesToHex(msgBytes));
    const bindIDMsg = {
      ethAddr: idAddr,
      name,
      signature: signatureObj.signature,
      ksign: keyOperationalPub,
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
   * Creates identity address from given keys through counterfactoual
   * It adds automatically the operational key to the identity merkle tree
   * @param  {String} op - Operation key
   * @param  {String} rec - Recovery key
   * @param  {String} rev - Revoke key
   */
  createID(op, rec, rev) {
    const keys = {
      operationalpk: op,
      recoverer: rec,
      revokator: rev,
    };
    return axios.post(`${this.url}/id`, keys);
  }

  /**
   * @param  {String} idAddr
   */
  getID(idAddr) {
    return axios.get(`${this.url}/id/${idAddr}`);
  }

  /**
   * Deploy smart contract of the given idenity on the blockchain
   * @param  {String} idAddr - Identity address
   */
  deployID(idAddr) {
    return axios.post(`${this.url}/id/${idAddr}/deploy`);
  }
}

module.exports = Relay;
