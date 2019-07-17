/**
 * Database interface for memory allocation
 */
class MemorydB {
  constructor() {
    this.db = new Map();
  }

  /**
   * Method to store [key - value] on database
   * @param {String} key
   * @param {String} value
   */

  insert(key, value) {
    this.db.set(key, value);
  }

  /**
   * Method to retrieve a value given a key
   * @param {String} key
   * @returns {String}
   */

  get(key) {
    const value = this.db.get(key);
    if (value === undefined) { return null; }
    return value;
  }

  /**
   * Method to delete a value given a key
   * @param {String} key
   */

  delete(key) {
    this.db.delete(key);
  }

  /**
   * Method to delete all the [key - value] items
   */

  deleteAll() {
    this.db.clear();
  }

  /**
   * Get all keys of the memory
   * @returns {Array} Contains all the keys
   */

  listKeys() {
    const keyList = [];
    const keysIter = this.db.keys();
    for (let i = 0; i < this.db.size; i++) {
      keyList.push(keysIter.next().value);
    }
    return keyList;
  }

  /**
   * Gets all the memory data and packs it into a string
   * @returns {String} - packed data
   */

  export() {
    const dbExp = {};
    this.db.forEach((value, key) => {
      dbExp[key] = value;
    });
    const dbExpStr = JSON.stringify(dbExp);
    return dbExpStr;
  }

  /**
   * Saves packed data into memory
   * @param {String} dbExpStr - packed data
   */

  import(dbExpStr) {
    try {
      const dbExp = JSON.parse(dbExpStr);
      Object.keys(dbExp).forEach((key) => {
        this.db.set(key, dbExp[key]);
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = MemorydB;
