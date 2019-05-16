// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;

/**
 * Class representing an assign name claim
 * Assign name claim is used to bind an identity addres with a human readable text
 * Assign name entry representation is as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |32 bytes|
 * |element 1|: |empty|identity| - |12 bytes|20 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class AssignName {
  claimType: Buffer;
  version: Buffer;
  hashName: Buffer;
  id: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, hashName: Buffer, id: Buffer) {
    this.claimType = utils.bigIntToBufferBE(bigInt(CONSTANTS.CLAIMS.ASSIGN_NAME.TYPE)).slice(24, 32);
    this.version = version;
    this.hashName = hashName;
    this.id = id;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, name: string, id: string): AssignName {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const hashName = utils.hashBytes(Buffer.from(name, 'utf8')).fill(0, 0, 1);
    const idBuff = utils.hexToBytes(id);
    return new AssignName(versionBuff, hashName, idBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} AssignName class object
  */
  static newFromEntry(entry: Entry): AssignName {
    const versionBuff = entry.elements[3].slice(20, 24);
    // Parse element 2
    const hashName = entry.elements[2].slice(1, 32);
    // Parse element 1
    const idBuff = entry.elements[1].slice(12, 32);
    return new AssignName(versionBuff, hashName, idBuff);
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
    // Entry element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this.hashName.length;
    claimEntry.elements[2].fill(this.hashName, startIndex, endIndex);
    // Entry element 1 composition
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - this.id.length;
    claimEntry.elements[1].fill(this.id, startIndex, endIndex);
    // Entry element 0 remains as empty value
    return claimEntry;
  }
}
