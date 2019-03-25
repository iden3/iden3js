const CONSTANTS = require('../constants');

/**
 * Database interface for memory allocation
 */
class MemorydB {
  /**
   * @param {Bool} prefix - Database prefix 'i3db-' added to key values
   */
  constructor(prefix = true) {
    this.prefix = prefix ? CONSTANTS.DBPREFIX : '';
    this.db = new Map();
  }

  /**
   * Method to store [key - value] on database
   * @param {String} key
   * @param {String} value
   */
  insert(key, value) {
    this.db.set(this.prefix + key, value);
  }

  /**
   * Method to retrieve a value given a key
   * @param {String} key
   * @returns {String}
   */
  get(key) {
    const value = this.db.get(this.prefix + key);
    if (value === undefined) { return null; }
    return value;
  }

  /**
   * Method to delete a value given a key
   * @param {String} key
   */
  delete(key) {
    this.db.delete(this.prefix + key);
  }

  /**
   * Method to delete all the [key - value] items
   */
  deleteAll() {
    this.db.clear();
  }
}

module.exports = MemorydB;
