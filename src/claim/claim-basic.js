// @flow
import { Entry } from './entry';

const claimUtils = require('./claim');

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
    claimUtils.checkByteLen(index, 50);
    this.index = index;
    claimUtils.checkByteLen(extraData, 62);
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
    const { version } = claimUtils.getClaimTypeVersion(entry);
    // Parse element 3 and element 2
    const index = Buffer.concat(
      [claimUtils.getElemBuf(entry.elements[2], 0, 31), claimUtils.getElemBuf(entry.elements[3], 8 + 4, 19)],
    );
    // Parse element 1 and element 0
    const extraData = Buffer.concat(
      [claimUtils.getElemBuf(entry.elements[0], 0, 31), claimUtils.getElemBuf(entry.elements[1], 0, 31)],
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.BASIC.TYPE, this.version);
    claimUtils.copyToElemBuf(entry.elements[3], 4 + 8, this.index.slice(this.index.length - 19));
    // Entry element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, this.index.slice(0, this.index.length - 19));
    // Entry element 1 composition
    claimUtils.copyToElemBuf(entry.elements[1], 0, this.extraData.slice(this.extraData.length - 31));
    // Entry element 0 composition
    claimUtils.copyToElemBuf(entry.elements[0], 0, this.extraData.slice(0, this.extraData.length - 31));
    return entry;
  }
}
