// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;
const helpers = require('../../sparse-merkle-tree/sparse-merkle-tree-utils');

/**
 * Class representing an object linked to an identity
 * Hash object is used to store an object representation through a hash
 * Link object identity entry representation is as follows:
 * |element 3|: |empty|object index|object type|hash type|version|claim type| - |10 bytes|2 bytes|4 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |12 bytes|20 bytes|
 * |element 1|: |hash object| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class LinkObjectIdentity {
  claimType: Buffer;
  version: Buffer;
  hashType: Buffer;
  objectType: Buffer;
  objectIndex: Buffer;
  idAddr: Buffer;
  objectHash: Buffer;
  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * @param {Buffer} version - specifies version of the claim
   * @param {Buffer} hashType - indicates what kind of hash is used on object hash
   * @param {Buffer} objectType - indicates object associated with object hash
   * @param {Buffer} objectIndex - instance of the object
   * @param {Buffer} idAddr - identity address linked to object
   * @param {Buffer} objectHash - Hash representing the object
   */
  constructor(version: Buffer, hashType: Buffer, objectType: Buffer, objectIndex: Buffer, idAddr: Buffer, objectHash: Buffer) {
    this.claimType = helpers.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.LINK_OBJECT_IDENTITY.TYPE)).slice(24, 32);
    this.version = version;
    this.hashType = hashType;
    this.objectType = objectType;
    this.objectIndex = objectIndex;
    this.idAddr = idAddr;
    this.objectHash = objectHash;
  }

  /**
   * Initialize claim data structure from fields
   */
  // eslint-disable-next-line max-len
  static new(version: number, hashType: number, objectType: number, objectIndex: number, idAddr: string, objectHash: string): LinkObjectIdentity {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const hashTypeBuff = Buffer.alloc(4);
    hashTypeBuff.writeUInt32BE(hashType, 0);
    const objectTypeBuff = Buffer.alloc(4);
    objectTypeBuff.writeUInt32BE(objectType, 0);
    const objectIndexBuff = Buffer.alloc(2);
    objectIndexBuff.writeUInt16BE(objectIndex, 0);
    const objectHashBuff = utils.hexToBytes(objectHash);
    const idAddrBuff = utils.hexToBytes(idAddr);
    return new LinkObjectIdentity(versionBuff, hashTypeBuff, objectTypeBuff, objectIndexBuff, idAddrBuff, objectHashBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry) {
    // Parse element 3
    const versionBuff = entry.elements[3].slice(20, 24);
    const hashTypeBuff = entry.elements[3].slice(16, 20);
    const objectTypeBuff = entry.elements[3].slice(12, 16);
    const objectIndexBuff = entry.elements[3].slice(10, 12);
    // Parse element 2
    const idAddrBuff = entry.elements[2].slice(12, 32);
    // Parse element 1
    const objectHashBuff = entry.elements[1].slice(0, 32);
    return new LinkObjectIdentity(versionBuff, hashTypeBuff, objectTypeBuff, objectIndexBuff, idAddrBuff, objectHashBuff);
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  toEntry(): Entry {
    const claimEntry = Entry.newEmpty();
    let endIndex = claimEntry.elements[3].length;
    let startIndex = endIndex - this.claimType.length;
    // Entry element 3 composition
    claimEntry.elements[3].fill(this.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.version.length;
    claimEntry.elements[3].fill(this.version, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.hashType.length;
    claimEntry.elements[3].fill(this.hashType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.objectType.length;
    claimEntry.elements[3].fill(this.objectType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.objectIndex.length;
    claimEntry.elements[3].fill(this.objectIndex, startIndex, endIndex);
    // Entry element 2 remains as empty value
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this.idAddr.length;
    claimEntry.elements[2].fill(this.idAddr, startIndex, endIndex);
    // Entry element 1 composition
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - this.objectHash.length;
    claimEntry.elements[1].fill(this.objectHash, startIndex, endIndex);
    // Entry element 0 remains as empty value
    return claimEntry;
  }
}
