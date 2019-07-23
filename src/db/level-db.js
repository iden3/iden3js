const level = require('level');
const CONSTANTS = require('../constants');
/**
 * Database interface for level db file
 */
class LeveldB {
  /**
   * @param {Bool} prefix - Database prefix 'i3db-' added to key values
   */
  constructor(prefix = true, pathDb = `${__dirname}/leveldir`) {
    this.prefix = prefix ? CONSTANTS.DBPREFIX : '';
    this.pathDb = pathDb;
    this.db = level(this.pathDb);
  }

  insert(key, value) {
    this.db.put(this.prefix + key, value);
  }

  get(key) {
    const self = this;
    return new Promise((resolve) => {
      self.db.get(self.prefix + key, (err, value) => {
        if (err) return resolve(null);
        resolve(value);
        return value;
      });
    });
  }

  delete(key) {
    this.db.del(this.prefix + key);
  }

  close() {
    this.db.close();
  }

  async deleteAll() {
    const keysList = await this.listKeys();
    for (let i = 0; i < keysList.length; i++) {
      this.db.del(this.prefix + keysList[i]);
    }
  }

  listKeys(/* prefix */) {
    const keysList = [];
    const self = this;
    // let subprefix = prefix;
    return new Promise((resolve, reject) => {
      self.db.createKeyStream()
        .on('data', (data) => {
          if (data.indexOf(self.prefix /* + subprefix */) !== -1) {
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
  }

  async export() {
    const dbExp = {};
    const keysList = await this.listKeys();
    for (let i = 0; i < keysList.length; i++) {
      dbExp[keysList[i]] = await this.get(keysList[i]);
    }
    const dbExpStr = JSON.stringify(dbExp);
    return dbExpStr;
  }

  import(dbExpStr) {
    try {
      const dbExp = JSON.parse(dbExpStr);
      Object.keys(dbExp).forEach(async (key) => {
        await this.insert(key, dbExp[key]);
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = LeveldB;
