const claim = require('../claim/claim');
const DataBase = require('../db/db');
const CONSTANTS = require('../constants');

/**
 * Class representing a user identity
 * Manage all possible actions related to identity usage
 */
class Id {
  /**
   * @param  {String} keyOpPub - Operational public key
   * @param  {String} keyRecover - Recovery address key
   * @param  {String} keyRevoke - Revoke address key
   * @param  {Object} relay - Relay associated with the identity
   * @param  {Object} relayAddr - Relay address
   * @param  {String} implementation
   * @param  {String} backup
   * @param  {Number} keyProfilePath - Path derivation related to key chain derivation for this identity
   */
  constructor(keyOpPub, keyRecover, keyRevoke, relay, relayAddr, implementation = '', backup = undefined, keyProfilePath = 0) {
    const db = new DataBase();
    this.db = db;
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOperationalPub = keyOpPub;
    this.relay = relay;
    this.relayAddr = relayAddr; // this can be get from a relay endpoint
    this.idAddr = undefined;
    this.implementation = implementation;
    this.backup = backup;
    this.prefix = CONSTANTS.IDPREFIX;
    this.keyProfilePath = keyProfilePath;
  }

  /**
   * Save keys associated with this identity address
   */
  saveKeys() {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const objectValue = {
      keyProfilePath: this.keyProfilePath,
      keyPath: 3,
      keys: {
        operationalPub: this.keyOperationalPub,
        recover: this.keyRecover,
        revoke: this.keyRevoke,
      },
    };
    this.db.insert(stringKey, JSON.stringify(objectValue));
  }

  /**
   * Create new key for this identity
   * @param {Object} keyContainer - Object containing all the keys created on local storage
   * @returns {String} - New address key generated
   */
  createKey(keyContainer, keyLabel) {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const keyObject = JSON.parse(this.db.get(stringKey));
    const newKey = keyContainer.generateSingleKey(this.keyProfilePath, keyObject.keyPath);
    keyObject.keyPath += 1;
    keyObject.keys[keyLabel] = newKey;
    this.db.insert(stringKey, JSON.stringify(keyObject));
    return newKey;
  }

  /**
   * Get all the keys associated to this idenity
   * @returns {Object} Contains all the keys as an object: { 'label key': 'key value' }
   */
  getKeys() {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const keyObject = JSON.parse(this.db.get(stringKey));
    return keyObject.keys;
  }

  createID() {
    // send the data to Relay,and get the generated address of the counterfactual
    return this.relay.createID(this.keyOperationalPub, this.keyRecover, this.keyRevoke)
      .then((res) => {
        this.idAddr = res.data.idaddr;
        this.saveKeys();
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
    return this.relay.bindID(kc, this.idAddr, this.keyOperationalPub, name);
  }
}

module.exports = Id;
