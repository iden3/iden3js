// @flow
import { Entry } from './entry';

const bs58 = require('bs58');
const claimUtils = require('./claim');

/**
 * Class representing an assign name claim
 * Assign name claim is used to bind an identity addres with a human readable text
 * Assign name entry representation is as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |1 byte|31 bytes|
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
    this.hashName = claimUtils.hashString(name);
    this.id = id;
  }

  /**
   * Decode field claim structure into raw data claim structure
   * @param {Object} entry - Entry of the claim
   * @returns {Object} AssignName class object
   */
  static newFromEntry(entry: Entry): AssignName {
    // Parse element 3
    const { version } = claimUtils.getClaimTypeVersion(entry);
    // Parse element 2
    const hashName = claimUtils.getElemBuf(entry.elements[2], 0, 31);
    // Parse element 1
    const id = bs58.encode(claimUtils.getElemBuf(entry.elements[1], 0, 31));
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.ASSIGN_NAME.TYPE, this.version);
    // Entry element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, this.hashName);
    // Entry element 1 composition
    claimUtils.copyToElemBuf(entry.elements[1], 0, bs58.decode(this.id));
    // Entry element 0 remains as empty value
    return entry;
  }
}
