const LocalStorageContainer = require('./local-storage-container');

/**
 * @param  {String} type
 */
class KeyContainer {
  constructor(type, db) {
    if (type === 'localStorage') {
      return new LocalStorageContainer(db);
    }
    return undefined;
  }
}

module.exports = KeyContainer;
