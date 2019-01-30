const axios = require('axios');
const utils = require('../utils');

async function axios_get_debug(url) {
  console.log("### GET " + url);
  const res = await axios.get(url).then((_res) => {
    console.log("Returns:\n```js");
    console.log(JSON.stringify(_res.data, null, 2));
    console.log("```");
    return _res;
  }).catch((_err) => {
    console.log("Error:" + _err);
  });
  return Promise.resolve(res);
}

async function axios_post_debug(url, data) {
  console.log("### POST " + url);
  console.log("Input:\n```js");
  console.log(JSON.stringify(data, null, 2));
  console.log("```");
  const res = await axios.post(url, data).then((_res) => {
    console.log("Returns:\n```js");
    console.log(JSON.stringify(_res.data, null, 2));
    console.log("```");
    return _res;
  }).catch((_err) => {
    console.log("Error:" + _err);
  });
  return Promise.resolve(res);
}

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
    // return axios.get(`${this.url}/claim_proof/${idAddr}/hi/${hi}`);
    return axios.get(`${this.url}/claim_proof/idaddr/${idAddr}/hi/${hi}`);
  }

  /**
   * Construct proper object to bind an identity adress to a label
   * Name resolver server creates the claim binding { Label - Identity address }
   * @param  {Object} kc - Keycontainer
   * @param  {String} idAddr - Identity address
   * @param  {String} keyOperationalPub - Key used to sign the message sent
   * @param  {String} name - Label to bind
   * @return {Object} Http response
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
      ksignpk: keyOperationalPub,
    };

    return axios.post(`${this.url}/vinculateid`, bindIDMsg);
  }

  /**
   * Search name string into the name resolver and it retrieves the corresponding public address
   * @param {String} name - Label to search into the name resolver tree
   * @return {Object} Http response
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
   * Retrieve information about identity
   * Information returned is the one necessary to create the counterfactoual
   * @param  {String} idAddr
   * @returns {Object} Http response
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
