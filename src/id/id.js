const claim = require('../claim/claim');
const api = require('../api/api');
const utils = require('../utils');

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

  /**
   * Create an identity. Will call the Relay and will receive a counterfactual address (not the deployed onto the chain yet).
   */
  create() {
    // send the data to Relay,and get the generated address of the counterfactual
    const keys = {
      operational: this.keyOperational,
      recoverer: this.keyRecover,
      revokator: this.keyRevoke,
    };

    return api.createId(this.relay.url, keys)
      .then((res) => {
        this.idAddr = res.data.idaddr;
        return this.idAddr;
      });
  }

  deploy() {
    return api.deployId(this.relay.url, this.idAddr);
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
   * Bind a label with an identity in the Relay.
   *
   * @param {Object} kc - Key container
   * @param {String} label - To bind to an address
   */
  bindWithLabel(kc, label) {
    const idBytes = utils.hexToBytes(this.idAddr);
    const dataBytes = Buffer.concat([Buffer.from([]), idBytes, Buffer.from(label)]);
    const signedData = kc.sign(this.keyOperational, utils.bytesToHex(dataBytes));

    return api.bindIdLabel(this.relay.url, {
      ethID: this.idAddr,
      name: label,
      signature: signedData.signature, // for the moment, signature(idAddr+name)
      ksign: this.keyOperational,
    });
  }

  /**
   * Get from the Relay, the root of this identity Merkle tree.
   */
  getRoot() {
    return api.getIdRoot(this.relay.url, this.idAddr);
  }

  /**
   * Retrieve from the Relay information regarding this identity such as address,
   * key address and if is deployed in the blockchain or not.
   */
  getInformation() {
    return api.getIdInfo(this.relay.url, this.idAddr);
  }
}

module.exports = Id;
