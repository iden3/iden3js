// @flow

type Entity = {
  idAddr: string,
  name: string,
  kOpPub: string,
  kOpAddr: string,
  trusted: { relay: boolean },
};

/**
 * Class representing a discovery client
 */
class Discovery {
  entitites: { [string]: Entity };

  /**
   * Initialization Discovery object
   * @param {String} entititesJSON - map of entitites serialized in JSON
   */
  constructor(entititesJSON: string) {
    this.entitites = JSON.parse(entititesJSON);
    Object.keys(this.entitites).forEach((idAddr) => { this.entitites[idAddr].idAddr = idAddr; });
  }

  /**
   * Get entry from an idAddr
   * @param {String} idAddr
   * @returns {?Entity} entity
   */
  getEntity(idAddr: string): ?Entity {
    return this.entitites[idAddr];
  }
}

/* Temporary entitites configuration data.  Use only for testing.  To be
 * deleted after the discovery protocol becomes stable. */
const testEntititesJSON = `
{
  "0x0123456789abcdef0123456789abcdef01234567": {
    "name": "iden3-test-relay",
    "kOpAddr": "0xe0fbce58cfaa72812103f003adce3f284fe5fc7c",
    "kOpPub": "0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59",
    "trusted": { "relay": true }
  }
}`;

module.exports = {
  Discovery,
  testEntititesJSON,
};