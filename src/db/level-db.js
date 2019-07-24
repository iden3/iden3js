const level = require('level');
const CONSTANTS = require('../constants');

class LeveldB {
  constructor(prefix = true, pathDb = `${__dirname}/leveldir`) {
    this.prefix = prefix ? CONSTANTS.DBPREFIX : '';
    this.pathDb = pathDb;
    this.db = level(this.pathDb);
  }

  insert(key, value) {
    this.db.put(this.prefix + key, value);
  }

  get(key, cb) {
    this.db.get(this.prefix + key, (err, value) => {
      if (err) return cb(null);
      return cb(value);
    });
  }

  delete(key, cb) {
    this.db.del(this.prefix + key, (err) => {
      if (err) return cb(false);
      return cb(true);
    });
  }

  close() {
    this.db.close();
  }

  deleteAll(cb) {
    this.listKeys((listKeys) => {
      const op = [];
      for (let i = 0; i < listKeys.length; i++) {
        op.push({ type: 'del', key: this.prefix + listKeys[i] });
      }
      this.db.batch(op, (err) => {
        if (err) return cb(false);
        return cb(true);
      });
    });
  }

  listKeys(cb) {
    const keysList = [];
    this.db.createKeyStream()
      .on('data', (data) => {
        if (data.indexOf(this.prefix) !== -1) {
          keysList.push(data.replace(this.prefix, ''));
        }
      })
      .on('close', () => {
        cb(keysList);
      });
  }

  export(cb) {
    const dbExp = {};
    this.db.createReadStream()
      .on('data', (data) => {
        dbExp[data.key] = data.value;
      })
      .on('close', () => {
        const dbExpStr = JSON.stringify(dbExp);
        return cb(dbExpStr);
      });
  }

  import(dbExpStr, cb) {
    try {
      const dbExp = JSON.parse(dbExpStr);
      Object.keys(dbExp).forEach((key) => {
        this.db.put(key, dbExp[key]);
      });
      return cb(true);
    } catch (error) {
      return cb(false);
    }
  }
}

module.exports = LeveldB;
