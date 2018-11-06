const CONSTANTS = require('../constants');
const LocalStorageContainer = require('./local-storage-container');

/**
 * @param  {String} type
 */
class KeyContainer {
  constructor(type) {
    if (type === CONSTANTS.STORAGE.LOCAL_STORAGE.ID) {
      return new LocalStorageContainer();
    }
    return undefined;
  }
}

module.exports = KeyContainer;
