const kcUtils = require('../key-container/kc-utils');
const CONSTANTS = require('../constants');

/**
 * @param {String} url - url of the backup system backend
 */
class Db {
  constructor() {
    this.prefix = CONSTANTS.DBPREFIX;
  }

  /**
   * @param {String} key
   * @param {String} value
   */
  insert(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  /**
   * @param {String} key
   * @returns {String}
   */
  get(key) {
    return localStorage.getItem(this.prefix + key);
  }

  /**
   * @param {String} key
   */
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  deleteAll() {
    localStorage.clear();
  }

  /**
   * Get all keys of the localStorage that match the given prefix
   * @param {String} prefix - Added to internal database prefix
   * @returns {Array} Contains all the keys found
   */
  listKeys(prefix) {
    const keyList = [];
    const localStorageLength = localStorage.length;
    for (let i = 0, len = localStorageLength; i < len; i++) {
      // get only the stored data related to identities (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix + prefix) !== -1) {
        const key = localStorage.key(i);
        keyList.push(key.replace(this.prefix, ''));
      }
    }
    return keyList;
  }

  /**
   * Gets all the localStorage data related with the iden3js library, and packs it into an encrpyted string
   * @param {Object} kc - KeyContainer
   * @returns {Object} - encrypted packed data
   */
  exportLocalStorage(kc) {
    if (!kc.encryptionKey) {
      // KeyContainer not unlocked
      console.error('Error: KeyContainer not unlocked');
      return undefined;
    }
    const dbExp = {};

    for (let i = 0; i < localStorage.length; i++) {
      // get only the stored data related to db (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        dbExp[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
      }
    }
    const dbExpStr = JSON.stringify(dbExp);
    return kcUtils.encrypt(kc.encryptionKey, dbExpStr); // encrypted database
  }

  /**
   * Decrypts the encrypted packed data and saves it into localStorage
   * @param {Object} kc - KeyContainer
   * @param {String} Database encrypted
   */
  importLocalStorage(kc, dbEncrypted) {
    const dbExpStr = kcUtils.decrypt(kc.encryptionKey, dbEncrypted);
    const dbExp = JSON.parse(dbExpStr);

    Object.keys(dbExp).forEach((key) => {
      localStorage.setItem(key, dbExp[key]);
    });
  }

  /**
   * Gets all the localStorage data and packs it into an encrpyted string
   * @param {Object} kc - KeyContainer
   * @returns {String} - Encrypted packed data
   */
  exportWallet(kc) {
    try {
      const lsStr = JSON.stringify(localStorage);
      const pubBackupKey = kc.getBackupPubKey();

      return kcUtils.encryptBox(pubBackupKey, lsStr);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Decrypts the encrypted database packed data and saves it into localStorage
   * @param {String} masterSeed - Mnemonic representing the master seed
   * @param {Object} kc - KeyContainer
   * @param {String} Database encrypted
   * @returns {Bool} - True if database is imported correctly, otherwise False
   */
  importWallet(masterSeed, kc, dbEncrypted) {
    try {
      const keyPair = kc.getPrivKeyBackUpFromSeed(masterSeed);
      const dbExpStr = kcUtils.decryptBox(keyPair.privateKey, keyPair.publicKey, dbEncrypted);
      const dbExp = JSON.parse(dbExpStr);

      this.deleteAll();
      Object.keys(dbExp).forEach((key) => {
        localStorage.setItem(key, dbExp[key]);
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = Db;
