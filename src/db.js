const nacl = require('tweetnacl');
const kcUtils = require('./key-container/kc-utils');
const CONSTANTS = require('./constants');

// if (typeof localStorage === 'undefined' || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./tmp');
// }

class Db {
  constructor() {
    this.prefix = CONSTANTS.DBPREFIX;
  }

  insert(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }
  get(key) {
    return localStorage.getItem(this.prefix + key);
  }
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }
  deleteAll() {
    localStorage.clear();
  }
  export(kc, idAddr, ksign) {
    if(!kc.encryptionKey) {
      // KeyContainer not unlocked
      console.log("Error: KeyContainer not unlocked");
      return undefined;
    }
    let dbExp = {};

    for (let i = 0; i < localStorage.length; i++) {
      // get only the stored data related to db (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        dbExp[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
      }
    }
    const dbExpStr = JSON.stringify(dbExp);

    const dbEncr = kcUtils.encrypt(kc.encryptionKey, dbExpStr);
    return dbEncr;
  }

  import (kc, dbEncr) {
    const dbExpStr = kcUtils.decrypt(kc.encryptionKey, dbEncr);
    const dbExp = JSON.parse(dbExpStr);
    for (var property in dbExp) {
        if (dbExp.hasOwnProperty(property)) {
            localStorage.setItem(property, dbExp[property]);
        }
    }
  }
}

module.exports = Db;
