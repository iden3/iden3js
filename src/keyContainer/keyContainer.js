const LocalstorageContainer = require('./localstorageContainer');

/**
 * @param  {String} type
 */
class KeyContainer {
  constructor(type) {
    if (type === 'localstorage') {
      return new LocalstorageContainer();
    }
    return undefined;
  }
}

module.exports = KeyContainer;
