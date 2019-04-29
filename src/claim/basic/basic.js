// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;

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
  claimType: Buffer;
  version: Buffer;
  index: Buffer;
  extraData: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, index: Buffer, extraData: Buffer) {
    this.claimType = utils.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.BASIC.TYPE)).slice(24, 32);
    this.version = version;
    this.index = index;
    this.extraData = extraData;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, index: string, extraData: string): Basic {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const indexBuff = utils.hexToBytes(index);
    const extraDataBuff = utils.hexToBytes(extraData);
    return new Basic(versionBuff, indexBuff, extraDataBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry): Basic {
    // Parse element 3 and element 2
    const versionBuff = entry.elements[3].slice(20, 24);
    const indexBuff = Buffer.concat([entry.elements[2].slice(1, 32), entry.elements[3].slice(1, 20)]);
    // Parse element 2 and element 1
    const extraDataBuff = Buffer.concat([entry.elements[0].slice(1, 32), entry.elements[1].slice(1, 32)]);
    return new Basic(versionBuff, indexBuff, extraDataBuff);
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Entry representation of the claim
   */
  createEntry(): Entry {
    const claimEntry = Entry.newEmpty();
    let endIndex = claimEntry.elements[3].length;
    let startIndex = endIndex - this.claimType.length;
    // element 3 composition
    claimEntry.elements[3].fill(this.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.version.length;
    claimEntry.elements[3].fill(this.version, startIndex, endIndex);
    // Get first part of the index
    let indexLen = this.index.length;
    const firstSlotIndex = this.index.slice(indexLen - 19, indexLen);
    endIndex = startIndex;
    startIndex = endIndex - firstSlotIndex.length;
    claimEntry.elements[3].fill(firstSlotIndex, startIndex, endIndex);

    // element 2 composition
    // Get second part of the index
    const secondSlotIndex = this.index.slice(0, indexLen - 19);
    endIndex = claimEntry.elements[2].length;
    startIndex = endIndex - secondSlotIndex.length;
    claimEntry.elements[2].fill(secondSlotIndex, startIndex, endIndex);

    // element 1 composition
    // Get first part of the data
    indexLen = this.extraData.length;
    const firstSlotExtra = this.extraData.slice(indexLen - 31, indexLen);
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - firstSlotExtra.length;
    claimEntry.elements[1].fill(firstSlotExtra, startIndex, endIndex);

    // element 0 composition
    // Get second part of the data
    const secondSlotExtra = this.extraData.slice(0, indexLen - 31);
    endIndex = claimEntry.elements[0].length;
    startIndex = claimEntry.elements[0].length - secondSlotExtra.length;
    claimEntry.elements[0].fill(secondSlotExtra, startIndex, endIndex);
    return claimEntry;
  }
}
