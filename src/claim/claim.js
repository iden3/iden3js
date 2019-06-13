// @flow
import { Entry } from './entry';

const bs58 = require('bs58');
const snarkjs = require('snarkjs');
const utils = require('../utils');

const { bigInt } = snarkjs;

export const CLAIMTYPES = {
  BASIC: {
    DEF: 'basic',
    TYPE: 0,
  },
  AUTHORIZE_KSIGN_BABYJUB: {
    DEF: 'authorizeKSignBabyJub',
    TYPE: 1,
  },
  SET_ROOT_KEY: {
    DEF: 'setRootKey',
    TYPE: 2,
  },
  ASSIGN_NAME: {
    DEF: 'assignName',
    TYPE: 3,
  },
  AUTHORIZE_KSIGN_SECP256K1: {
    DEF: 'authorizeKSignSecp256k1',
    TYPE: 4,
  },
  LINK_OBJECT_IDENTITY: {
    DEF: 'linkObjectIdentity',
    TYPE: 5,
  },
  AUTHORIZE_ETH_KEY: {
    DEF: 'authorizeEthKey',
    TYPE: 9,
  },
};

/**
 * Decode a buffer as number in big endian
  * @param {Buffer} Buffer
  * @returns {number}
 */
function buf2num(buf: Buffer): number {
  return Number(utils.bufferToBigIntBE(buf));
}

/**
 * Encode a number as a 4 byte buffer in big endian
  * @param {number} num
  * @returns {Buffer}
 */
function num2buf(num: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(num, 0);
  return buf;
}

/**
 * Encode a number as a 2 byte buffer in big endian
  * @param {number} num
  * @returns {Buffer}
 */
function num2buf2(num: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(num, 0);
  return buf;
}

/**
 * Hash a string for a claim
  * @param {string} elem
  * @returns {Buffer} hash
 */
function hashString(s: string): Buffer {
  return utils.hashBytes(Buffer.from(s, 'utf8')).slice(1);
}

/**
 * Copy a buffer to an entry element ending at position start
  * @param {Buffer} elem
  * @param {number} start
  * @param {Buffer} src
 */
function copyToElemBuf(elem: Buffer, start: number, src: Buffer) {
  elem.fill(src, 32 - start - src.length, 32 - start);
}

/**
 * Get a buffer from an entry element ending at position start
  * @param {Buffer} elem
  * @param {number} start
  * @param {number} length
 */
function getElemBuf(elem: Buffer, start: number, length: number): Buffer {
  return elem.slice(32 - start - length, 32 - start);
}

/**
 * Set the claim type and version of an entry
  * @param {Object} entry - Entry of the claim
  * @param {number} claimType
  * @param {number} version
 */
function setClaimTypeVersion(entry: Entry, claimType: number, version: number) {
  const claimTypeBuf = utils.bigIntToBufferBE(bigInt(claimType)).slice(24, 32);
  copyToElemBuf(entry.elements[3], 0, claimTypeBuf);
  copyToElemBuf(entry.elements[3], 8, num2buf(version));
}

/**
 * get the claim type and version of an entry
  * @param {Object} entry - Entry of the claim
  * @returns {Object} type and version
 */
function getClaimTypeVersion(entry: Entry): { claimType: number, version: number } {
  return {
    claimType: buf2num(getElemBuf(entry.elements[3], 0, 8)),
    version: buf2num(getElemBuf(entry.elements[3], 8, 4)),
  };
}

/**
 * Class representing an assign name claim
 * Assign name claim is used to bind an identity addres with a human readable text
 * Assign name entry representation is as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |32 bytes|
 * |element 1|: |empty|identity| - |1 bytes|31 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class AssignName {
  version: number;
  hashName: Buffer;
  id: string;

  /**
   * Initialize claim data structure from fields
   */
  constructor(name: string, id: string) {
    this.version = 0;
    this.hashName = hashString(name);
    this.id = id;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} AssignName class object
  */
  static newFromEntry(entry: Entry): AssignName {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    // Parse element 2
    const hashName = getElemBuf(entry.elements[2], 0, 31);
    // Parse element 1
    const id = bs58.encode(getElemBuf(entry.elements[1], 0, 31));
    const claim = new AssignName('', id);
    claim.hashName = hashName;
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // Entry element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.ASSIGN_NAME.TYPE, this.version);
    // Entry element 2 composition
    copyToElemBuf(entry.elements[2], 0, this.hashName);
    // Entry element 1 composition
    copyToElemBuf(entry.elements[1], 0, bs58.decode(this.id));
    // Entry element 0 remains as empty value
    return entry;
  }
}

export class AuthorizeEthKey {
  version: number;
  ethKey: string;
  ethKeyType: number;

  /**
   * Initialize claim data structure from fields
   */
  constructor(ethKey: string, ethKeyType: number) {
    this.version = 0;
    this.ethKey = ethKey;
    this.ethKeyType = ethKeyType;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeEthKey class object
  */
  static newFromEntry(entry: Entry): AuthorizeEthKey {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    // Parse element 2
    const ethKey = `0x${getElemBuf(entry.elements[2], 0, 20).toString('hex')}`;
    const ethKeyType = buf2num(getElemBuf(entry.elements[2], 20, 4));
    const claim = new AuthorizeEthKey(ethKey, ethKeyType);
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // claim element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.AUTHORIZE_ETH_KEY.TYPE, this.version);
    // claim element 2 composition
    copyToElemBuf(entry.elements[2], 0, utils.hexToBytes(this.ethKey));
    copyToElemBuf(entry.elements[2], 20, num2buf(this.ethKeyType));
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}

/**
 * Class representing an authorized Ksign claim with babyjub curve
 * Authorized Ksign Babyjub claim is used to authorize a public key for being used afterwards
 * Public key is stored in its compress format composed by Ay ( coordinate ) and its sign
 * Authorized Ksign Babyjub element representation is as follows:
 * |element 3|: |empty|sign|version|claim type| - |19 bytes|1 bytes|4 bytes|8 bytes|
 * |element 2|: |Ay| - |32 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class AuthorizeKSignBabyJub {
  sign: boolean;
  version: number;
  ay: Buffer;

  /**
   * Initialize claim data structure from fields
   */
  constructor(pubKComp: string) {
    const pubKCompBuf = utils.hexToBytes(pubKComp);
    this.sign = (pubKCompBuf[0] & 0x80) !== 0;
    pubKCompBuf[0] &= 0x7F;
    this.ay = pubKCompBuf;
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSignBabyJub class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignBabyJub {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    // Parse element 2
    const ay = getElemBuf(entry.elements[2], 0, 32);
    const sign = getElemBuf(entry.elements[3], 8 + 4, 1)[0] !== 0;
    ay[0] |= sign ? 0x80 : 0x00;
    const claim = new AuthorizeKSignBabyJub(ay.toString('hex'));
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // claim element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.AUTHORIZE_KSIGN_BABYJUB.TYPE, this.version);
    copyToElemBuf(entry.elements[3], 8 + 4, Buffer.from([this.sign ? 1 : 0]));
    // claim element 2 composition
    copyToElemBuf(entry.elements[2], 0, this.ay);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}

/**
 * Class representing an authorized Ksign claim with elliptic curve as secp256k1
 * This claim aims to use ethereum public key until zkSnarks are implemented using a Jubjub curve
 * Authorized KsignSecp256k1 claim is used to authorize a public key that belongs to elliptic curve secp256k1 for being used afterwards
 * Authorized KsignSecp256k1 element representation is as follows:
 * |element 3|: |empty|public key[0]|version|claim type| - |18 bytes|2 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|public key[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class AuthorizeKSignSecp256k1 {
  version: number;
  pubKeyComp: Buffer;

  /**
   * Initialize claim data structure from fields
   */
  constructor(pubKeyCompHex: string) {
    this.pubKeyComp = utils.hexToBytes(pubKeyCompHex);
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSign class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignSecp256k1 {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    // Parse element 3 and element 2
    const pubKeyCompBuf = Buffer.concat(
      [getElemBuf(entry.elements[2], 0, 31), getElemBuf(entry.elements[3], 8 + 4, 2)],
    );
    const claim = new AuthorizeKSignSecp256k1(pubKeyCompBuf.toString('hex'));
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // claim element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.AUTHORIZE_KSIGN_SECP256K1.TYPE, this.version);
    copyToElemBuf(entry.elements[3], 8 + 4, this.pubKeyComp.slice(this.pubKeyComp.length - 2));
    // claim element 2 composition
    copyToElemBuf(entry.elements[2], 0, this.pubKeyComp.slice(0, this.pubKeyComp.length - 2));
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}

/**
 * Class representing a basic claim
 * Basic claim is used to issue generic data
 * Index and Data are split into two fields to fit claim element data structure
 * Basic entry representation is as follows:
 * |element 3|: |empty|index[0]|version|claim type| - |1 byte|19 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|index[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty|data[0]| - |1 bytes|31 bytes|
 * |element 0|: |empty|data[1]| - |1 bytes|31 bytes|
 */
export class Basic {
  version: number;
  index: Buffer;
  extraData: Buffer;

  /**
   * Initialize claim data structure from fields
   */
  constructor(index: Buffer, extraData: Buffer) {
    this.index = index;
    this.extraData = extraData;
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry): Basic {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    // Parse element 3 and element 2
    const index = Buffer.concat(
      [getElemBuf(entry.elements[2], 0, 31), getElemBuf(entry.elements[3], 8 + 4, 19)],
    );
    // Parse element 1 and element 0
    const extraData = Buffer.concat(
      [getElemBuf(entry.elements[0], 0, 31), getElemBuf(entry.elements[1], 0, 31)],
    );
    const claim = new Basic(index, extraData);
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // Entry element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.BASIC.TYPE, this.version);
    copyToElemBuf(entry.elements[3], 4 + 8, this.index.slice(this.index.length - 19));
    // Entry element 2 composition
    copyToElemBuf(entry.elements[2], 0, this.index.slice(0, this.index.length - 19));
    // Entry element 1 composition
    copyToElemBuf(entry.elements[1], 0, this.extraData.slice(this.extraData.length - 31));
    // Entry element 0 composition
    copyToElemBuf(entry.elements[0], 0, this.extraData.slice(0, this.extraData.length - 31));
    return entry;
  }
}

export const TYPE_OBJECT = {
  passport: 0,
  address: 1,
  phone: 2,
  dob: 3,
  givenName: 4,
  familyName: 5,
  certificate_A: 6,
  storage: 7,
};


/**
 * Class representing an object linked to an identity
 * Hash object is used to store an object representation through a hash
 * Link object identity entry representation is as follows:
 * |element 3|: |empty|object index|object type|version|claim type| - |14 bytes|2 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |1 empty|31 bytes|
 * |element 1|: |hash object| - |32 bytes|
 * |element 0|: |auxData| - |32 bytes|
 */
export class LinkObjectIdentity {
  version: number;
  objectType: number;
  objectIndex: number;
  id: string;
  objectHash: Buffer;
  auxData: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * @param {number} objectType - indicates object associated with object hash
   * @param {number} objectIndex - instance of the object
   * @param {string} id - identity address linked to object
   * @param {Buffer} objectHash - Hash representing the object
   * @param {Buffer} auxData - Auxiliary data to complement hash object
   */
  constructor(objectType: number, objectIndex: number, id: string, objectHash: Buffer, auxData: Buffer) {
    this.objectType = objectType;
    this.objectIndex = objectIndex;
    this.id = id;
    this.objectHash = objectHash;
    this.auxData = auxData;
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry) {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    const objectType = buf2num(getElemBuf(entry.elements[3], 8 + 4, 4));
    const objectIndex = buf2num(getElemBuf(entry.elements[3], 8 + 4 + 4, 2));
    // Parse element 2
    const id = bs58.encode(getElemBuf(entry.elements[2], 0, 31));
    // Parse element 1
    const objectHash = getElemBuf(entry.elements[1], 0, 31);
    // Parse element 0
    const auxData = getElemBuf(entry.elements[0], 0, 31);
    const claim = new LinkObjectIdentity(objectType, objectIndex, id, objectHash, auxData);
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // Entry element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.LINK_OBJECT_IDENTITY.TYPE, this.version);
    copyToElemBuf(entry.elements[3], 8 + 4, num2buf(this.objectType));
    copyToElemBuf(entry.elements[3], 8 + 4 + 4, num2buf2(this.objectIndex));
    // Entry element 2 composition
    copyToElemBuf(entry.elements[2], 0, bs58.decode(this.id));
    // Entry element 1 composition
    copyToElemBuf(entry.elements[1], 0, this.objectHash);
    // Entry element 0 composition
    copyToElemBuf(entry.elements[0], 0, this.auxData);
    return entry;
  }
}

/**
 * Class representing a set root key claim
 * Set root key claim is used to commit a root of a merkle by a given identity
 * Set root key name entry representation is as follows:
 * |element 3|: |empty|era|version|claim type| - |16 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |1 byte|31 bytes|
 * |element 1|: |root key| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class SetRootKey {
  version: number;
  era: number;
  id: string;
  rootKey: Buffer;

  /**
   * Initialize claim data structure from fields
   */
  constructor(id: string, rootKey: Buffer) {
    this.id = id;
    this.rootKey = rootKey;
    this.version = 0;
    this.era = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry) {
    // Parse element 3
    const { version } = getClaimTypeVersion(entry);
    const era = buf2num(getElemBuf(entry.elements[3], 8 + 4, 4));
    // Parse element 2
    const id = bs58.encode(getElemBuf(entry.elements[2], 0, 31));
    // Parse element 1
    const rootKey = getElemBuf(entry.elements[1], 0, 32);
    const claim = new SetRootKey(id, rootKey);
    claim.version = version;
    claim.era = era;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // Entry element 3 composition
    setClaimTypeVersion(entry, CLAIMTYPES.SET_ROOT_KEY.TYPE, this.version);
    copyToElemBuf(entry.elements[3], 8 + 4, num2buf(this.era));
    // Entry element 2 composition
    copyToElemBuf(entry.elements[2], 0, bs58.decode(this.id));
    // Entry element 1 composition
    copyToElemBuf(entry.elements[1], 0, this.rootKey);
    // Entry element 0 remains as empty value
    return entry;
  }
}

/**
 * Decode entry class into claim data structure depending on its type
 * @param {Object} entry - Claim element structure
 * @returns {Object} Claim raw data
 */
// eslint-disable-next-line max-len
export function newClaimFromEntry(entry: Entry): void | Basic | AuthorizeKSignBabyJub | SetRootKey | AssignName | AuthorizeKSignSecp256k1 | LinkObjectIdentity | AuthorizeEthKey {
  // Decode claim type from Entry class
  const { claimType } = getClaimTypeVersion(entry);
  // Parse elements and return the proper claim structure
  switch (claimType) {
    case CLAIMTYPES.BASIC.TYPE:
      return Basic.newFromEntry(entry);
    case CLAIMTYPES.AUTHORIZE_KSIGN_BABYJUB.TYPE:
      return AuthorizeKSignBabyJub.newFromEntry(entry);
    case CLAIMTYPES.SET_ROOT_KEY.TYPE:
      return SetRootKey.newFromEntry(entry);
    case CLAIMTYPES.ASSIGN_NAME.TYPE:
      return AssignName.newFromEntry(entry);
    case CLAIMTYPES.AUTHORIZE_KSIGN_SECP256K1.TYPE:
      return AuthorizeKSignSecp256k1.newFromEntry(entry);
    case CLAIMTYPES.LINK_OBJECT_IDENTITY.TYPE:
      return LinkObjectIdentity.newFromEntry(entry);
    case CLAIMTYPES.AUTHORIZE_ETH_KEY.TYPE:
      return AuthorizeEthKey.newFromEntry(entry);
    default:
      throw new Error(`Unknown claim type ${claimType}`);
  }
}

export { Entry };
