// @flow

/**
 * Class representing a name resolver
 */
class NameResolver {
  names: { [string]: string };

  /**
   * Initialization NameResolver object
   * @param {String} namesJSON - map of domains to idAddr in JSON
   */
  constructor(namesJSON: string) {
    this.names = JSON.parse(namesJSON);
  }

  /**
   * Resolve a name to an idAddr
   * @param {String} name
   * @returns {?String} idAddr
   */
  resolve(name: string): ?string {
    return this.names[name];
  }
}

/* Temporary names configuration data.  Use only for testing.  To be deleted
 * after the domain name assignment / resolution becomes stable. */
const testNamesJSON = `
{
  "iden3.io": "1N7d2qVEJeqnYAWVi5Cq6PLj6GwxaW6FYcfmY2fps",
  "iden3.eth": "11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij"
}`;

module.exports = {
  NameResolver,
  testNamesJSON,
};
