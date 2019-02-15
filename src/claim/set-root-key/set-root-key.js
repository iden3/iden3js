// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;
const helpers = require('../../sparse-merkle-tree/sparse-merkle-tree-utils');

/**
 * Class representing a set root key claim
 * Set root key claim is used to commit a root of a merkle by a given identity
 * Set root key name entry representation is as follows:
 * |element 3|: |empty|era|version|claim type| - |16 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |12 bytes|20 bytes|
 * |element 1|: |root key| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class SetRootKey {
  claimType: Buffer;
  version: Buffer;
  era: Buffer;
  id: Buffer;
  rootKey: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according entry claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, era: Buffer, id: Buffer, rootKey: Buffer) {
    this.claimType = helpers.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.SET_ROOT_KEY.TYPE)).slice(24, 32);
    this.version = version;
    this.era = era;
    this.id = id;
    this.rootKey = rootKey;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, era: number, id: string, rootKey: string): SetRootKey {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const eraBuff = Buffer.alloc(4);
    eraBuff.writeUInt32BE(era, 0);
    const idBuff = utils.hexToBytes(id);
    const rootKeyBuff = utils.hexToBytes(rootKey);
    return new SetRootKey(versionBuff, eraBuff, idBuff, rootKeyBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Entry of the claim
  * @returns {Object} SetRootKey class object
  */
  static newFromEntry(entry: Entry) {
    // Parse element 3
    const versionBuff = entry.elements[3].slice(20, 24);
    const eraBuff = entry.elements[3].slice(16, 20);
    // Parse element 2
    const idBuff = entry.elements[2].slice(12, 32);
    // Parse element 1
    const rootKeyBuff = entry.elements[1].slice(0, 32);
    return new SetRootKey(versionBuff, eraBuff, idBuff, rootKeyBuff);
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
    startIndex = endIndex - this.era.length;
    claimEntry.elements[3].fill(this.era, startIndex, endIndex);
    // Entry element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this.id.length;
    claimEntry.elements[2].fill(this.id, startIndex, endIndex);
    // Entry element 1 composition
    endIndex = claimEntry.elements[1].length;
    startIndex = claimEntry.elements[1].length - this.rootKey.length;
    claimEntry.elements[1].fill(this.rootKey, startIndex, endIndex);
    // Entry element 0 remains as empty value
    return claimEntry;
  }
}
