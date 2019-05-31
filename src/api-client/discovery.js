// @flow

type Entity = {
  idAddr: string,
  name: string,
  kOpPub: string,
  trusted: { relay: boolean },
};

/**
 * Class representing a discovery client
 */
class Discovery {
  entities: { [string]: Entity };

  /**
   * Initialization Discovery object
   * @param {String} entitiesJSON - map of entitites serialized in JSON
   */
  constructor(entitiesJSON: string) {
    this.entities = JSON.parse(entitiesJSON);
    Object.keys(this.entities).forEach((idAddr) => { this.entities[idAddr].idAddr = idAddr; });
  }

  /**
   * Get entry from an idAddr
   * @param {String} idAddr
   * @returns {?Entity} entity
   */
  getEntity(idAddr: string): ?Entity {
    return this.entities[idAddr];
  }
}

/* Temporary entitites configuration data.  Use only for testing.  To be
 * deleted after the discovery protocol becomes stable. */
const testEntitiesJSON = `
{
  "0x0123456789abcdef0123456789abcdef01234567": {
    "name": "iden3-test-relay",
    "kOpAddr": "0xe0fbce58cfaa72812103f003adce3f284fe5fc7c",
    "kOpPub": "0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59",
    "trusted": { "relay": true }
  },
  "11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij": {
    "name": "iden3-test-relay2",
    "kOpAddr": "0x7633bc9012f924100fae50d6dda7162b0bba720d",
    "kOpPub": "0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59",
    "trusted": { "relay": true }
  },
  "1N7d2qVEJeqnYAWVi5Cq6PLj6GwxaW6FYcfmY2fps": {
    "name": "iden3-test-relay3",
    "kOpPub": "117f0a278b32db7380b078cdb451b509a2ed591664d1bac464e8c35a90646796",
    "trusted": { "relay": true }
  },
  "1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z": {
    "name": "iden3-name-server",
    "kOpAddr": "0x7633bc9012f924100fae50d6dda7162b0bba720d",
    "kOpPub": "0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59",
    "trusted": { "relay": true }
  }
}`;

module.exports = {
  Discovery,
  testEntitiesJSON,
};
