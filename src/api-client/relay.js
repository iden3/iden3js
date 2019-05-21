import { axiosGetDebug, axiosPostDebug } from './http-debug';

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
  constructor(url, debug = false) {
    this.url = url;
    this.debug = debug;
    if (this.debug) {
      this.getFn = axiosGetDebug;
      this.postFn = axiosPostDebug;
    } else {
      this.getFn = axios.get;
      this.postFn = axios.post;
    }
  }

  /**
   * Retrieve the merkle tree root of the relay
   * @returns {Object} - Http response
   */
  getRelayRoot() {
    return this.getFn(`${this.url}/root`);
  }

  /**
   * Retrieve the merkle tree root of the given identity merkle tree
   * @param {String} isAddr - Identity address
   * @returns {Object} - Http response
   */
  getIdRoot(idAddr) {
    return this.getFn(`${this.url}/ids/${idAddr}/root`);
  }

  /**
   * Add a claim into the identity merkle tree
   * @param {String} idAddr - Identity address
   * @param {Object} bytesSignedMsg - Data necessary to create the claim: { claim data, signature, key sign }
   * @returns {Object} - Http response
   */
  postClaim(idAddr, bytesSignedMsg) {
    return this.postFn(`${this.url}/ids/${idAddr}/claims`, bytesSignedMsg);
  }

  /**
   * Retrieve claim data from identity merkle tree
   * @param  {String} idAddr - Identity address
   * @param  {String} hi - Claim index hash
   * @returns {Object} - Http response
   */
  getClaimByHi(idAddr, hi) {
    // return this.getFn(`${this.url}/claim_proof/${idAddr}/hi/${hi}`);
    return this.getFn(`${this.url}/ids/${idAddr}/claims/${hi}/proof`);
  }

  /**
   * Creates identity address from given keys through counterfactoual
   * It adds automatically the operational key to the identity merkle tree
   * @param  {String} op - Operation key
   * @param  {String} rec - Recovery key
   * @param  {String} rev - Revoke key
   */
  createId(op, rec, rev) {
    const keys = {
      operationalPk: op,
      recoveryPk: rec,
      revokePk: rev,
    };

    return this.postFn(`${this.url}/ids`, keys);
  }

  /**
   * Retrieve information about identity
   * Information returned is the one necessary to create the counterfactoual
   * @param  {String} idAddr
   * @returns {Object} Http response
   */
  getId(idAddr) {
    return this.getFn(`${this.url}/ids/${idAddr}`);
  }

  /**
   * Deploy smart contract of the given idenity on the blockchain
   * @param  {String} idAddr - Identity address
   */
  deployId(idAddr) {
    return this.postFn(`${this.url}/ids/${idAddr}/deploy`);
  }
}

module.exports = Relay;
