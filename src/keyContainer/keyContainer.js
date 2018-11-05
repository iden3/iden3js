const LocalstorageContainer = require('./localstorageContainer');
const TeststorageContainer = require('./teststorageContainer');

/**
 * @param  {String} type
 */
class KeyContainer {
  constructor(type) {
    if (type === 'teststorage') {
      return new TeststorageContainer();
    } if (type === 'localstorage') {
      return new LocalstorageContainer();
    }
    return undefined;
  }
}

module.exports = KeyContainer;
