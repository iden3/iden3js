const merkletree = require('../merkletree');
const utils = require('../utils');

/**
 * @param  {uint32} u
 * @returns {Buffer}
 */
var uint32ToEthBytes = function(u) { // compatible with Uint32ToEthBytes() go-iden3 version
  var buf = new Buffer(4);
  buf.writeUIntBE(u, 0, 4); // also can be used buf.writeUInt32BE(u);
  return buf;
}

/**
 * @param  {Buffer} b
 * @returns {uint32}
 */
var ethBytesToUint32 = function(b) { // compatible with EthBytesToUint32() go-iden3 version
  return b.readUIntBE(0, 4);
}

/**
 * @param  {uint64} u
 * @returns {Buffer}
 */
var uint64ToEthBytes = function(u) { // compatible with Uint64ToEthBytes() go-iden3 version
  var buf = new Buffer(8);
  buf.writeUIntBE(u, 0, 8);
  return buf;
}

/**
 * @param  {Buffer} b
 * @returns {uint64}
 */
var ethBytesToUint64 = function(b) { // compatible with EthBytesToUint64() go-iden3 version
  return b.readUIntBE(0, 8);
}

/**
 * @param  {String} namespaceStr
 * @param  {String} typeStr
 * @param  {String} data
 * @returns  {Object} claim
 */
class ClaimDefault {
  constructor(namespaceStr, typeStr, extraIndexData, data) {
    if (namespaceStr === undefined) {
      namespaceStr = '';
    }
    if (typeStr === undefined) {
      typeStr = '';
    }
    if (extraIndexData === undefined) {
      extraIndexData = '';
    }
    if (data === undefined) {
      data = '';
    }
    this.claim = {
      baseIndex: {
        namespace: utils.hashBytes(Buffer.from(namespaceStr)),
        type: utils.hashBytes(Buffer.from(typeStr)).slice(0, 24),
        indexLength: 64 + Buffer.from(extraIndexData).length,
        version: 0
      },
      extraIndex: {
        data: Buffer.from(extraIndexData)
      },
      data: Buffer.from(data)
    };
  }
  bytes() {
    var b = new Buffer([]);
    b = Buffer.concat([b, this.claim.baseIndex.namespace]);
    b = Buffer.concat([b, this.claim.baseIndex.type]);
    b = Buffer.concat([
      b,
      uint32ToEthBytes(this.claim.baseIndex.indexLength)
    ]);
    b = Buffer.concat([
      b,
      uint32ToEthBytes(this.claim.baseIndex.version)
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

/**
 * @param  {Buffer} bytes
 * @returns  {Object} claim
 */
var parseClaimDefaultBytes = function(b) {
  let c = new ClaimDefault();
  c.claim = {
    baseIndex: {
      namespace: b.slice(0, 32),
      type: b.slice(32, 56),
      indexLength: ethBytesToUint32(b.slice(56, 60)),
      version: ethBytesToUint32(b.slice(60, 64))
    },
    extraIndex: {
      data: b.slice(64, ethBytesToUint32(b.slice(56, 60)))
    },
    data: b.slice(ethBytesToUint32(b.slice(56, 60)), b.length)
  };
  return c;
}

/**
 * @param  {String} namespaceStr
 * @param  {String} keyToAuthorize
 * @param  {String} applicationName
 * @param  {String} applicationAuthz
 * @param  {Number} validFrom
 * @param  {Number} validUntil
 * @returns {Object} claim
 */
class AuthorizeKSignClaim {
  constructor(namespaceStr, keyToAuthorize, applicationName, applicationAuthz, validFrom, validUntil) {
    if (namespaceStr === undefined) {
      namespaceStr = '';
    }
    if (keyToAuthorize === undefined) {
      keyToAuthorize = '';
    }
    if (applicationName === undefined) {
      applicationName = '';
    }
    if (applicationAuthz === undefined) {
      applicationAuthz = '';
    }
    if (validFrom === undefined) {
      validFrom = '';
    }
    if (validUntil === undefined) {
      validUntil = '';
    }
    this.claim = {
      baseIndex: {
        namespace: utils.hashBytes(Buffer.from(namespaceStr)),
        type: utils.hashBytes(Buffer.from('authorizeksign')).slice(0, 24),
        indexLength: 84,
        version: 0
      },
      extraIndex: {
        keyToAuthorize: keyToAuthorize
      },
      application: utils.hashBytes(Buffer.from(applicationName)),
      applicationAuthz: utils.hashBytes(Buffer.from(applicationAuthz)),
      validFrom: validFrom,
      validUntil: validUntil
    };
  }
  bytes() {
    var b = new Buffer([]);
    b = Buffer.concat([b, this.claim.baseIndex.namespace]);
    b = Buffer.concat([b, this.claim.baseIndex.type]);
    b = Buffer.concat([
      b,
      uint32ToEthBytes(this.claim.baseIndex.indexLength)
    ]);
    b = Buffer.concat([
      b,
      uint32ToEthBytes(this.claim.baseIndex.version)
    ]);
    b = Buffer.concat([
      b,
      utils.hexToBytes(this.claim.extraIndex.keyToAuthorize)
    ]);
    b = Buffer.concat([b, this.claim.application]);
    b = Buffer.concat([b, this.claim.applicationAuthz]);
    let validFromBuf = uint64ToEthBytes(this.claim.validFrom);
    b = Buffer.concat([b, validFromBuf]);
    let validUntilBuf = uint64ToEthBytes(this.claim.validUntil);
    b = Buffer.concat([b, validUntilBuf]);
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

/**
 * @param  {Buffer} bytes
 * @returns {Object} claim
 */
var parseAuthorizeKSignClaim = function(b) {
  let validFromBytes = b.slice(148, 156);
  let validFrom = ethBytesToUint64(validFromBytes);
  let validUntilBytes = b.slice(156, 164);
  let validUntil = ethBytesToUint64(validUntilBytes);
  let c = new AuthorizeKSignClaim();
  c.claim = {
    baseIndex: {
      namespace: b.slice(0, 32),
      type: b.slice(32, 56),
      indexLength: ethBytesToUint32(b.slice(56, 60)),
      version: ethBytesToUint32(b.slice(60, 64))
    },
    extraIndex: {
      keyToAuthorize: utils.bytesToHex(b.slice(64, 84))
    },
    application: b.slice(84, 116),
    applicationAuthz: b.slice(116, 148),
    validFrom: validFrom,
    validUntil: validUntil
  };
  return c;
}

module.exports = {
  uint32ToEthBytes,
  ethBytesToUint32,
  uint64ToEthBytes,
  ethBytesToUint64,
  ClaimDefault,
  parseClaimDefaultBytes,
  AuthorizeKSignClaim,
  parseAuthorizeKSignClaim
}
