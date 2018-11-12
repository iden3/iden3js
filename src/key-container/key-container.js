const LocalStorageContainer = require('./local-storage-container');

/**
 * @param  {String} type
 */
class KeyContainer {
  constructor(type) {
    if (type === 'localStorage') {
      return new LocalStorageContainer();
    }
    return undefined;
  }
}

module.exports = KeyContainer;
