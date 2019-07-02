// @flow
import { Entry } from './entry';

const bs58 = require('bs58');
const claimUtils = require('./claim-utils');

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
    claimUtils.checkByteLen(bs58.decode(id), 31);
    this.id = id;
    claimUtils.checkElemFitsClaim(objectHash);
    this.objectHash = objectHash;
    claimUtils.checkElemFitsClaim(auxData);
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
    const { version } = claimUtils.getClaimTypeVersion(entry);
    const objectType = claimUtils.buf2num(claimUtils.getElemBuf(entry.elements[3], 8 + 4, 4));
    const objectIndex = claimUtils.buf2num(claimUtils.getElemBuf(entry.elements[3], 8 + 4 + 4, 2));
    // Parse element 2
    const id = bs58.encode(claimUtils.getElemBuf(entry.elements[2], 0, 31));
    // Parse element 1
    const objectHash = claimUtils.getElemBuf(entry.elements[1], 0, 32);
    // Parse element 0
    const auxData = claimUtils.getElemBuf(entry.elements[0], 0, 32);
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.LINK_OBJECT_IDENTITY.TYPE, this.version);
    claimUtils.copyToElemBuf(entry.elements[3], 8 + 4, claimUtils.num2buf(this.objectType));
    claimUtils.copyToElemBuf(entry.elements[3], 8 + 4 + 4, claimUtils.num2buf2(this.objectIndex));
    // Entry element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, bs58.decode(this.id));
    // Entry element 1 composition
    claimUtils.copyToElemBuf(entry.elements[1], 0, this.objectHash);
    // Entry element 0 composition
    claimUtils.copyToElemBuf(entry.elements[0], 0, this.auxData);
    return entry;
  }
}
