const axios = require('axios');

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
    return axios.get(`${this.url}/ids/${idAddr}/root`);
  }

  /**
   * Add a claim into the identity merkle tree
   * @param {String} idAddr - Identity address
   * @param {Object} bytesSignedMsg - Data necessary to create the claim: { claim data, signature, key sign }
   * @returns {Object} - Http response
   */
  postClaim(idAddr, bytesSignedMsg) {
    return axios.post(`${this.url}/ids/${idAddr}/claims`, bytesSignedMsg);
  }

  /**
   * Retrieve claim data from identity merkle tree
   * @param  {String} idAddr - Identity address
   * @param  {String} hi - Claim index hash
   * @returns {Object} - Http response
   */
  getClaimByHi(idAddr, hi) {
    // return axios.get(`${this.url}/claim_proof/${idAddr}/hi/${hi}`);
    return axios.get(`${this.url}/ids/${idAddr}/claims/${hi}/proof`);
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

    return axios.post(`${this.url}/ids`, keys);
  }

  /**
   * Retrieve information about identity
   * Information returned is the one necessary to create the counterfactoual
   * @param  {String} idAddr
   * @returns {Object} Http response
   */
  getID(idAddr) {
    return axios.get(`${this.url}/ids/${idAddr}`);
  }

  /**
   * Deploy smart contract of the given idenity on the blockchain
   * @param  {String} idAddr - Identity address
   */
  deployID(idAddr) {
    return axios.post(`${this.url}/ids/${idAddr}/deploy`);
  }
}

module.exports = Relay;
