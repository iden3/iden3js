import { AuthorizeKSignSecp256k1 } from '../claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1';

const DataBase = require('../db/db');
const CONSTANTS = require('../constants');
const protocols = require('../protocols/protocols');
const not = require('../manager/manager-notification.js');
const sign = require('../protocols/login');
const notServer = require('../http/notification-server');

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
    this.discovery = undefined;
    this.nameResolver = undefined;
    this.signedPacketVerifier = undefined;
    this.manageNotifications = undefined;
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
   * Load discovery server
   * @param {Object} discovery - Represents all the functionalities of the discovery server
   */
  addDiscovery(discovery) {
    this.discovery = discovery;
  }

  /**
   * Load name resolver
   * @param {Object} nameResolver - Represents all the functionalities of the name resolver server
   */
  addNameResolver(nameResolver) {
    this.nameResolver = nameResolver;
  }

  /**
   * Initialize signed packet functionalities
   * It directly depends on name resolver and discovery service
   */
  initSignedPacketVerifier() {
    if (this.discovery == null || this.nameResolver == null) {
      throw new Error('id.discovery or id.nameResolver not set');
    }
    this.signedPacketVerifier = new sign.SignedPacketVerifier(this.discovery, this.nameResolver);
  }

  /**
   * Initialize manage notification functionalities
   * It directly depends on signed packet functions
   */
  initManageNotifications() {
    if (this.signedPacketVerifier == null) {
      throw new Error('id.signedPacketVerifier not set');
    }
    this.manageNotifications = new not.ManagerNotifications(this.signedPacketVerifier);
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
   * @param {Object} kc - Key container
   * @param {String} ksignpk - Key used to sign the claim. This key has to be already authorized on the identity merkle tree
   * @param {keyClaim} keyClaim - New key to be authorized and added into the identity merkle tree
   * @return {Object} - Http response
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
   * @param {Object} kSign - Key used to sign
   * @param {Object} proofKSign - proof verifying kSign is authorized
   * @param {String} name - Label to identify the address
   * @return {Object} - Http response
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
   * @return {Object} - Http response
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
          proofEthName, kc, kSign, proofKSign, expirationTime);
        // Send back to notification server 'signIdenAssert'
        return self.notificationServer.submitLogin(signedPacket)
          .then((resSubLogin) => {
            self.tokenLogin = resSubLogin.data.token;
            return resSubLogin;
          });
      });
  }

  /**
   * Send notification associated with this identity
   * @param {Object} kc - Key container
   * @param {Object} kSign - Key to sign the notification
   * @param {Object} proofKSign - Proof that kSign belongs to this identity
   * @param {String} idAddrDest - Address destiny
   * @param {String} destNotUrl - Notification server url associated to identty address destiny
   * @param {Object} notification - Notification stored on the notification service1
   * @return {Object} - Http response
   */
  sendNotification(kc, kSign, proofKSign, idAddrDest, destNotUrl, notification) {
    const expirationTime = Math.round((new Date()).getTime() / 1000) + 60;
    const signedMsg = protocols.login.signMsgV01(this.idAddr, kc, kSign, proofKSign,
      expirationTime, notification.type, notification.data);
    const destNotServerUrl = new notServer.NotificationServer(destNotUrl);
    return destNotServerUrl.postNotification(idAddrDest, signedMsg);
  }

  /**
   * Get notifications associated with this identity
   * @param {Number} beforeId - Specify get 10 notifications before this identifier
   * @param {Number} afterId - Specify get 10 notifications after this identifier
   * @return {Object} - Http response
   */
  getNotifications(beforeId = 0, afterId = 0) {
    if (this.manageNotifications == null) {
      throw new Error('id.manageNotifications not set');
    }
    return this.notificationServer.getNotifications(this.tokenLogin, beforeId, afterId)
      .then((resNot) => {
        const arrayNot = [];
        const { notifications } = resNot.data;
        if (notifications == null) {
          return arrayNot;
        }
        notifications.forEach((notification) => {
          const notFull = this.manageNotifications.checkNot(notification);
          arrayNot.push(notFull);
          if (notFull !== undefined) {
            if (this.storeNotification(notFull)) {
              this.manageNotifications.updateLastId(notFull.id);
            }
          }
        });
        return arrayNot;
      });
  }

  /**
   * Get last 10 notifications associated with this identity from last notification received
   * @return {Object} - Http response
   */
  getNotificationsFromLast() {
    if (this.manageNotifications == null) {
      throw new Error('id.manageNotifications not set');
    }
    const lastId = this.manageNotifications.lastIdNotification;
    return this.notificationServer.getNotifications(this.tokenLogin, 0, lastId)
      .then((resNot) => {
        const arrayNot = [];
        const { notifications } = resNot.data;
        if (notifications === null) {
          return undefined;
        }
        notifications.forEach((notification) => {
          const notFull = this.manageNotifications.checkNot(notification);
          arrayNot.push(notFull);
          if (notFull !== undefined) {
            if (this.storeNotification(notFull)) {
              this.manageNotifications.updateLastId(notFull.id);
            }
          }
        });
        return arrayNot;
      });
  }

  /**
   * Store content of notifications downloaded
   * @param {NotificationFull} notFull - Full notification data
   * @return {bool} - False if the notification is already stored on database
   * True if notification  is stored is successfully
   */
  storeNotification(notFull) {
    // Check if key already exist
    if (this.db.listKeys(`${this.prefix}-not-${notFull.id}`)) {
      return false;
    }
    // Store notification
    this.db.insert(`${this.prefix}-not-${notFull.id}`, JSON.stringify(notFull));
    return true;
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
