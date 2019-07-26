const level = require('level');
const CONSTANTS = require('../constants');
/**
 * Database interface for level db file
 */
class LeveldB {
  /**
   * @param {Bool} prefix - Database prefix 'i3db-' added to key values
   * @param {String} pathDb - Databse location
   */

  constructor(prefix = true, pathDb = `${__dirname}/leveldir`) {
    this.prefix = prefix ? CONSTANTS.DBPREFIX : '';
    this.pathDb = pathDb;
    this.db = level(this.pathDb);
  }

  /**
   * Method to store [key - value] on database
   * @param {String} key
   * @param {String} value
   */
  async insert(key, value) {
    await this.db.put(this.prefix + key, value);
  }

  /**
   * Method to retrieve a value given a key
   * @param {String} key
   * @returns {String}
   */
  async get(key) {
    try {
      const value = await this.db.get(this.prefix + key);
      return value;
    } catch (err) {
      if (err.notFound) {
        return null;
      }
      return undefined;
      //throw new Error('Can not get the value')
    }
  }

  /**
   * Method to delete a value given a key
   * @param {String} key
   */
  async delete(key) {
    await this.db.del(this.prefix + key/*, (err) => {
      if(err) throw new Error('can not delete the value')
    } */);
  }

  /**
   * Method to close database
   */
  async close() {
    await this.db.close();
  }

  /**
   * Method to delete all the [key - value] items
   */
  async deleteAll() {
    const keysList = await this.listKeys('');
    for (let i = 0; i < keysList.length; i++) {
      await this.delete(keysList[i]);
    }
  }

  /**
   * Get all keys of the database
   * @returns {Array} Contains all the keys found
   */
  async listKeys(prefix) {
    const keysList = [];
    const self = this;
    let subprefix = prefix;
    await new Promise((resolve, reject) => {
      self.db.createKeyStream()
        .on('data', (data) => {
          if (data.indexOf(self.prefix + subprefix ) !== -1) {
            keysList.push(data.replace(self.prefix, ''));
          }
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('close', () => {
          resolve(keysList);
        });
    });
    return keysList;
  }
  /**
   * Gets all the memory data and packs it into a string
   * @returns {String} - packed data
   */
  async export() {
    const dbExp = {};
    const keysList = await this.listKeys('');
    for (let i = 0; i < keysList.length; i++) {
      dbExp[keysList[i]] = await this.get(keysList[i]);
    }
    const dbExpStr = JSON.stringify(dbExp);
    return dbExpStr;
  }

  /**
   * Saves packed data into database
   * @param {String} dbExpStr - packed data
   * @returns {Bool} - If no error returns true
   */
  import(dbExpStr) {
    try {
      const dbExp = JSON.parse(dbExpStr);
      Object.keys(dbExp).forEach(async (key) => {
        await this.insert(key, dbExp[key]);
      });
      return true;
    } catch (error) {
      return false;
      //throw new Error('can not import the database')
    }
  }
}

module.exports = LeveldB;
