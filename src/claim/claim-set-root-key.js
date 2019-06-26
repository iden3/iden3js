// @flow
import { Entry } from './entry';

const bs58 = require('bs58');
const claimUtils = require('./claim');

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
    claimUtils.checkByteLen(bs58.decode(id), 31);
    this.id = id;
    claimUtils.checkElemFitsClaim(rootKey);
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
    const { version } = claimUtils.getClaimTypeVersion(entry);
    const era = claimUtils.buf2num(claimUtils.getElemBuf(entry.elements[3], 8 + 4, 4));
    // Parse element 2
    const id = bs58.encode(claimUtils.getElemBuf(entry.elements[2], 0, 31));
    // Parse element 1
    const rootKey = claimUtils.getElemBuf(entry.elements[1], 0, 32);
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.SET_ROOT_KEY.TYPE, this.version);
    claimUtils.copyToElemBuf(entry.elements[3], 8 + 4, claimUtils.num2buf(this.era));
    // Entry element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, bs58.decode(this.id));
    // Entry element 1 composition
    claimUtils.copyToElemBuf(entry.elements[1], 0, this.rootKey);
    // Entry element 0 remains as empty value
    return entry;
  }
}
