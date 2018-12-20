const claim = require('../claim/claim');
const api = require('../api/api');
const utils = require('../utils/utils');
const CONSTANTS = require('../constants');

const id = (function idModule() {
  let recoverKey;
  let revokeKey;
  let operationalKey;
  let relay;
  let relayAddress; // this can be get from a relay
  let address;
  let implementation;
  let backup;

  /**
   * Given a type and data related to a claim, generates a new claim.
   *
   * @param {string} type - Of the claim to authorize ('generic', 'kSignClaim', etc...). Types are in the constants file
   * @param {Object} data - Object with data of the claim that will vary depending on the claim type
   *
   * @returns {Object | null} with the new claim created
   */
  const generateNewClaim = function genNewClaim(type, data) {
    switch (type) {
      case CONSTANTS.CLAIMS.TYPES.GENERIC:
        return new claim.GenericClaim('namespace', data.typeStr, data.extraIndexData, data.data);
      case CONSTANTS.CLAIMS.TYPES.KSIGN_CLAIM:
        return new claim.AuthorizeKSignClaim(
          data.keyToAuthorize,
          data.applicationName,
          data.applicationAuthz,
          data.validFrom,
          data.validUntil,
        );
      default:
        return null;
    }
  };

  /**
   * Create an identity. Will call the Relay and will receive a counterfactual address (not the deployed onto the chain yet).
   */
  const create = async function createId(recKey, revKey, opKey, idRelay, relayAddr, impl = '', backupServer = undefined) {
    // send the data to Relay,and get the generated address of the counterfactual
    const createIdRes = await api.createId(relay.url, {
      operational: operationalKey,
      recoverer: recoverKey,
      revokator: revokeKey,
    });

    if (!createIdRes.data.idaddr) {
      return Promise.reject(new Error('Create id: no identity was created'));
    }

    recoverKey = recKey;
    revokeKey = revKey;
    operationalKey = opKey;
    relay = idRelay;
    relayAddress = relayAddr;
    implementation = impl;
    backup = backupServer;
    address = createIdRes.data.idaddr;

    return Promise.resolve(address);
  };

  /**
   * Call the Relay to deploy the identity in the blockchain.
   *
   * @returns {Promise} with the response of the relay if was successful
   */
  const deploy = function deployId() {
    return api.deployId(relay.url, address);
  };

  /**
   * Authorize a claim. This is factory that creates one or other depending on the type sent.
   * Calls the relay to post it there.
   *
   * @param {string} type - Of the claim to authorize ('generic', 'kSignClaim', etc...). Types are in the constants file
   * @param {Object} data - Object with data of the claim that will vary depending on the claim type
   *
   * @returns {Promise} with the response of the Relay after authorize the claim
   */
  const authorizeClaim = async function idAuthorizeClaim(type, data) {
    if (!type || type.constructor !== String || !data || Object.keys(data).length === 0) {
      return Promise.reject(new Error('Authorize claim: no type or data sent or bad type'));
    }

    const newClaim = generateNewClaim(type, data);

    if (!newClaim) {
      return Promise.reject(new Error('Authorize claim: unknown claim type'));
    }

    const signatureObj = data.kc.sign(data.kSign, data.authorizeKSignClaim.hex());
    const bytesSignedMsg = {
      valueHex: newClaim.hex(),
      signatureHex: signatureObj.signature,
      kSign: data.KSign,
    };
    const postClaimRes = await api.postClaim(relay.url, address, bytesSignedMsg);

    if (backup && data.proofOfKSign) {
      backup.backupData(data.kc, address, data.kSign, data.proofOfKSign, 'claim', newClaim.hex(), relayAddress);
    }

    return Promise.resolve(postClaimRes);
  };

  /**
   * Bind a label with an identity in the Relay.
   *
   * @param {Object} kc - Key container
   * @param {String} label - To bind to an address
   */
  const bindWithLabel = function bindIdWithLabel(kc, label) {
    const addressBytes = utils.hexToBytes(address);
    const dataBytes = Buffer.concat([Buffer.from([]), addressBytes, Buffer.from(label)]);
    const signedData = kc.sign(operationalKey, utils.bytesToHex(dataBytes));

    return api.bindIdLabel(relay.url, {
      ethID: address,
      name: label,
      signature: signedData.signature, // for the moment, signature(idAddress+name)
      ksign: operationalKey,
    });
  };

  /**
   * Get the ethereum address of an identity from the Relay.
   *
   * @param {string} label - Of an identity
   *
   * @returns {Promise} with an object that has the claim and the ethereum identity address
   */
  const getAddress = function getIdAddress(label) {
    return api.getIdAddress(relay.url, label);
  };

  /**
   * Options object to select a claim.
   * @typedef {Object} OptionsSelector
   * @property {string} name - 'hi'
   * @property {string} selector - Information to query, i.e. the hi
   */
  /**
   * Get proof of a claim.
   *
   * @param {OptionsSelector} selector - Indicating with which flag we get the type in the Relay.
   */
  const getClaim = function getClaimOfId(options = {}) {
    switch (options.name) {
      case 'hi':
        return api.getClaimByHi(relay.url, address, options.data);
      default:
        return Promise.reject(new Error('Get claim: No selector provided'));
    }
  };

  /**
   * Retrieve from the Relay information regarding this identity such as address,
   * key address and if is deployed in the blockchain or not.
   */
  const getInfo = function getIdInfo() {
    return api.getIdInfo(relay.url, address);
  };

  /**
   * Get from the Relay, the root of this identity Merkle tree.
   */
  const getRoot = function getIdRoot() {
    return api.getIdRoot(relay.url, address);
  };

  return {
    authorizeClaim,
    bindWithLabel,
    create,
    deploy,
    getAddress,
    getClaim,
    getInfo,
    getRoot,
  };
}());

module.exports = id;

/**
 * @param  {String} keyRecover
 * @param  {String} keyRevoke
 * @param  {String} keyOp
 * @param  {Object} relay
 * @param  {String} implementation
 */
// class Id {
  /**
   * @param  {Object} kc
   * @param  {String} kSign
   * @param  {String} typeStr
   * @param  {String} extraIndexData
   * @param  {String} data
   * @returns {Object}
   */
  /* genericClaim(kc, kSign, proofOfKSign, typeStr, extraIndexData, data) {
    const genericClaim = new claim.GenericClaim('namespace', typeStr, extraIndexData, data); // TODO namespace will be hardcoded in conf
    const signatureObj = kc.sign(kSign, genericClaim.hex());
    const bytesSignedMsg = {
      valueHex: genericClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: kSign,
    };

    const self = this;
    return api.postClaim(this.relay.url, this.idAddr, bytesSignedMsg)
      .then((res) => {
        if ((self.backup !== undefined) && (proofOfKSign !== undefined)) {
          self.backup.backupData(kc, self.idAddr, kSign, proofOfKSign, 'claim', genericClaim.hex(), self.relayAddr);
        }
        return res;
      });
  } */

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
  /* authorizeKSignClaim(kc, kSign, proofOfKSign, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    // TODO get proofOfKSign

    const authorizeKSignClaim = new claim.AuthorizeKSignClaim(keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil);
    const signatureObj = kc.sign(kSign, authorizeKSignClaim.hex());
    const bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      kSign,
    };
    const self = this;
    return api.postClaim(this.relay.url, this.idAddr, bytesSignedMsg)
      .then((res) => {
        if ((self.backup !== undefined) && (proofOfKSign !== undefined)) {
          self.backup.backupData(kc, self.idAddr, kSign, proofOfKSign, 'claim', authorizeKSignClaim.hex(), self.relayAddr);
        }
        return res;
      });
  } */
// }

// module.exports = Id;
