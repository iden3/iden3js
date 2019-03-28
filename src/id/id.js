import { AuthorizeKSignSecp256k1 } from '../claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1';

const DataBase = require('../db/db');
const CONSTANTS = require('../constants');
const protocols = require('../protocols/protocols');
/**
 * Class representing a user identity
 * Manage all possible actions related to identity usage
 */
class Id {
  /**
   * @param {String} keyOpPub - Operational public key
   * @param {String} keyRecover - Recovery address key
   * @param {String} keyRevoke - Revoke address key
   * @param {Object} relay - Relay associated with the identity
   * @param {Object} notificationServer - Notification server associated with the identity
   * @param {Number} keyProfilePath - Path derivation related to key chain derivation for this identity
   */
  constructor(keyOpPub, keyRecover, keyRevoke, relay, keyProfilePath = 0) {
    const db = new DataBase();
    this.db = db;
    this.keyRecover = keyRecover;
    this.keyRevoke = keyRevoke;
    this.keyOperationalPub = keyOpPub;
    this.relay = relay;
    this.prefix = CONSTANTS.IDPREFIX;
    this.keyProfilePath = keyProfilePath;
    this.nameServer = undefined;
    this.notificationServer = undefined;
    this.idAddr = undefined;
    this.backupServer = undefined;
    this.tokenLogin = undefined;
  }

  /**
   * Load name server
   * @param {Object} nameServer - Represents all the functionalities of the name server
   */
  addNameServer(nameServer) {
    this.nameServer = nameServer;
  }

  /**
   * Load notification server
   * @param {Object} notificationServer - Represents all the functionalities of the notification server
   */
  addNotificationServer(notificationServer) {
    this.notificationServer = notificationServer;
  }

  /**
   * Load backup server
   * @param {Object} backupServer - Represents all the functionalities of the backup server
   */
  addBackupServer(backupServer) {
    this.backupServer = backupServer;
  }

  /**
   * Save keys associated with this identity address
   */
  saveKeys() {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const objectValue = {
      keyProfilePath: this.keyProfilePath,
      keyPath: 4,
      keys: {
        operationalPub: this.keyOperationalPub,
        recover: this.keyRecover,
        revoke: this.keyRevoke,
      },
    };

    this.db.insert(stringKey, JSON.stringify(objectValue));
    return true;
  }

  /**
   * Retrieve address of the relay that has been linked to the identity address
   */
  getInfoIdentity() {
    return this.relay.getId(this.idAddr);
  }

  /**
   * Create new key for this identity and store it
   * @param {Object} keyContainer - Object containing all the keys created on local storage
   * @param {String} keyLabel - Label associated with the key or address created
   * @param {Bool} isPublic - Determines if it is wanted to generate a public key or a public address
   * @returns {Bool} Acknowledge
   */
  createKey(keyContainer, keyLabel, isPublic = false) {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const keyObject = JSON.parse(this.db.get(stringKey));
    const newKey = keyContainer.generateSingleKey(this.keyProfilePath, keyObject.keyPath, isPublic);

    keyObject.keyPath += 1;
    keyObject.keys[keyLabel] = newKey;
    this.db.insert(stringKey, JSON.stringify(keyObject));
    return newKey;
  }

  /**
   * Get all the keys associated to this idenity
   * @returns {Object} Contains all the keys as an object in a form: { label key - key }
   */
  getKeys() {
    const stringKey = this.prefix + CONSTANTS.KEYPREFIX + this.idAddr;
    const keyObject = JSON.parse(this.db.get(stringKey));

    return keyObject.keys;
  }

  /**
   * Send the data to Relay and gets the generated address of the counterfactual
   * @returns {Object} - Http response
   */
  createId() {
    return this.relay.createId(this.keyOperationalPub, this.keyRecover, this.keyRevoke)
      .then((res) => {
        this.idAddr = res.data.idAddr;
        this.saveKeys();
        return { idAddr: this.idAddr, proofClaim: res.data.proofClaim };
      });
  }

  /**
   * Send to relay a request for deplying identity smart contract
   * @returns {Object} - Http response
   */
  deployId() {
    return this.relay.deployId(this.idAddr);
  }

  /**
   * Send new claim of type authorizeKSignSecp256k1 to the identity merkle tree through the associated relay
   * @param {Object} - Key container
   * @param {String} - Key used to sign the claim. This key has to be already authorized on the identity merkle tree
   * @param {keyClaim} - New key to be authorized and added into the identity merkle tree
   */
  authorizeKSignSecp256k1(kc, ksignpk, keyClaim) {
    const authorizeKSignClaim = AuthorizeKSignSecp256k1.new(0, keyClaim);
    const claimHex = (authorizeKSignClaim.toEntry()).toHex();
    const signatureObj = kc.sign(ksignpk, claimHex);
    const bytesSignedMsg = {
      valueHex: claimHex,
      signatureHex: signatureObj.signature,
      ksignpk,
    };
    const self = this;

    return this.relay.postClaim(this.idAddr, bytesSignedMsg)
      .then((res) => {
        if ((self.backup !== undefined)) { // && (proofOfKSign !== undefined)) {
          // Private folder - future work
          // self.backupServer.backupData(kc, self.idAddr, ksign, proofOfKSign, 'claim', authorizeKSignClaim.hex(), self.relayAddr);
        }
        return res;
      });
  }

  /**
   * Bind current identity to an address through name resolver service
   * @param {Object} kc - Key container
   * @param {String} name - Label to identify the address
   */
  bindId(kc, kSign, proofKSign, name) {
    return this.nameServer.bindId(kc, kSign, proofKSign, this.idAddr, name);
  }

  /**
   * Login procedure to get token in order to interact with system notification service
   * @param {Object} proofEthName - proof verifying a label bind it to an address
   * @param {Object} kc - key container
   * @param {String} kSign - key used to sign
   * @param {Object} proofKSign - proof verifying a key belongs to a specific identity
   */
  loginNotificationServer(proofEthName, kc, kSign, proofKSign) {
    const self = this;
    return this.notificationServer.requestLogin()
      .then((resReqLogin) => {
        const { sigReq } = resReqLogin.data;
        // Sign 'signedPacket'
        const date = new Date();
        const unixtime = Math.round((date).getTime() / 1000);
        const expirationTime = unixtime + 60;
        const signedPacket = protocols.login.signIdenAssertV01(sigReq, self.idAddr,
          proofEthName.ethName, proofEthName.proofAssignName, kc, kSign, proofKSign, expirationTime);
        // Send back to notification server 'signIdenAssert'
        return self.notificationServer.submitLogin(signedPacket)
          .then((resSubLogin) => {
            self.tokenLogin = resSubLogin.data.token;
            return resSubLogin;
          });
      });
  }

  /**
   * Post notifications associated with this identity
   * @param {String} idAddrDest - Notification will be stored for this identity address
   * @param {String} notification - Notification to store
   * @return {Object} - Http response
   */
  postNotification(idAddrDest, notification) {
    return this.notificationServer.postNotification(this.tokenLogin, idAddrDest, notification);
  }

  /**
   * Get 10 notifications associated with this identity
   * @param {Number} beforeId - Specify get 10 notifications before this identifier
   * @param {Number} afterId - Specify get 10 notifications after this identifier
   * @return {Object} - Http response
   */
  getNotifications(beforeId = 0, afterId = 0) {
    return this.notificationServer.getNotifications(this.tokenLogin, beforeId, afterId);
  }

  /**
   * Delete all notifications associated with this idenity
   * @return {Object} - Http response
   */
  deleteNotifications() {
    return this.notificationServer.deleteNotifications(this.tokenLogin);
  }
}

module.exports = Id;
