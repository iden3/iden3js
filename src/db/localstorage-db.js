const CONSTANTS = require('../constants');

/**
 * @param {String} url - url of the backup system backend
 */
class Db {
  constructor(subprefix) {
    if (subprefix !== undefined) {
      this.prefix = CONSTANTS.DBPREFIX + subprefix;
    } else {
      this.prefix = CONSTANTS.DBPREFIX;
    }
  }

  /**
   * Method to store [key - value] on database
   * @param {String} key
   * @param {String} value
   */
  insert(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  /**
   * Method to retrieve a value given a key
   * @param {String} key
   * @returns {String}
   */
  get(key) {
    return localStorage.getItem(this.prefix + key);
  }

  /**
   * Method to delete a value given a key
   * @param {String} key
   */
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Method to delete all the [key - value] items
   */
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
   * Gets all the localStorage data related with the iden3js library and packs it into a string
   * @returns {String} - packed data
   */

  export() {
    const dbExp = {};

    for (let i = 0; i < localStorage.length; i++) {
      // get only the stored data related to db (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        dbExp[localStorage.key(i).replace(this.prefix, '')] = localStorage.getItem(localStorage.key(i));
      }
    }

    const dbExpStr = JSON.stringify(dbExp);
    return dbExpStr;
  }

  /**
   * Saves packed data into localStorage
   * @param {String} dbExpStr - packed data
   */

  import(dbExpStr) {
    try {
      const dbExp = JSON.parse(dbExpStr);
      Object.keys(dbExp).forEach((key) => {
        localStorage.setItem(this.prefix + key, dbExp[key]);
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = Db;
