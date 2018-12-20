const utils = require('../../utils/utils');

/**
 * @param  {String} namespaceStr
 * @param  {String} typeStr
 * @param  {String} data
 * @returns  {Object} claim
 */
class GenericClaim {
  constructor(namespaceStr = 'iden3.io', typeStr = 'default', extraIndexData = '', data = '') {
    this.claim = {
      baseIndex: {
        namespace: utils.hashBytes(Buffer.from(namespaceStr)),
        type: utils.hashBytes(Buffer.from(typeStr)).slice(0, 24),
        indexLength: 64 + Buffer.from(extraIndexData).length,
        version: 0,
      },
      extraIndex: {
        data: Buffer.from(extraIndexData),
      },
      data: Buffer.from(data),
    };
  }

  bytes() {
    let b = Buffer.from([]);
    b = Buffer.concat([b, this.claim.baseIndex.namespace]);
    b = Buffer.concat([b, this.claim.baseIndex.type]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.indexLength),
    ]);
    b = Buffer.concat([
      b,
      utils.uint32ToEthBytes(this.claim.baseIndex.version),
    ]);
    b = Buffer.concat([b, this.claim.extraIndex.data]);
    b = Buffer.concat([b, this.claim.data]);
    return b;
  }

  hex() {
    return utils.bytesToHex(this.bytes());
  }

  hi() {
    return utils.hashBytes(this.bytes().slice(0, this.claim.baseIndex.indexLength));
  }

  ht() {
    return utils.hashBytes(this.bytes());
  }
}

module.exports = GenericClaim;
