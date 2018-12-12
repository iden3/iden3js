const kcUtils = require('../key-container/kc-utils');
const CONSTANTS = require('../constants');

/**
 * @param  {String} url - url of the backup system backend
 */
class Db {
  constructor() {
    this.prefix = CONSTANTS.DBPREFIX;
  }

  /**
   * @param  {String} key
   * @param  {String} value
   */
  insert(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  /**
   * @param  {String} key
   * @returns {String}
   */
  get(key) {
    return localStorage.getItem(this.prefix + key);
  }

  /**
   * @param  {String} key
   */
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  deleteAll() {
    localStorage.clear();
  }

  /**
   * Gets all the localStorage data related with the iden3js library, and packs it into an encrpyted string.
   *
   * @param  {Object} kc - KeyContainer
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
   * Decrypts the encrypted packed data by the exportLocalStorage function, and saves it into localStorage.
   *
   * @param  {Object} kc - KeyContainer
   * @param  {String} encryptedDB
   */
  importLocalStorage(kc, encryptedDB) {
    const dbExpStr = kcUtils.decrypt(kc.encryptionKey, encryptedDB);
    const dbExp = JSON.parse(dbExpStr);

    Object.keys(dbExp).forEach((key) => {
      localStorage.setItem(key, dbExp[key]);
    });
  }
}

module.exports = Db;
