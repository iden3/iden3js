// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;

export class AuthorizeEthKey {
  claimType: Buffer;
  version: Buffer;
  ethKey: Buffer;
  ethKeyType: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, ethKey: Buffer, ethKeyType: Buffer) {
    this.claimType = utils.bigIntToBufferBE(bigInt(CONSTANTS.CLAIMS.AUTHORIZE_ETH_KEY.TYPE)).slice(24, 32);
    this.version = version;
    this.ethKey = ethKey;
    this.ethKeyType = ethKeyType;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, ethKey: string, ethKeyType: number): AuthorizeEthKey {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);

    const ethKeyTypeBuff = Buffer.alloc(4);
    ethKeyTypeBuff.writeUInt32BE(ethKeyType, 0);

    const ethKeyBuff = utils.hexToBytes(ethKey);

    return new AuthorizeEthKey(versionBuff, ethKeyBuff, ethKeyTypeBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeEthKey class object
  */
  static newFromEntry(entry: Entry): AuthorizeEthKey {
    // Parse element 3
    const versionBuff = entry.elements[3].slice(20, 24);
    // Parse element 2
    const ethKeyBuff = entry.elements[2].slice(12, 32); // 32-20= 12
    const ethKeyTypeBuff = entry.elements[2].slice(8, 12); // 32-24= 8
    return new AuthorizeEthKey(versionBuff, ethKeyBuff, ethKeyTypeBuff);
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  toEntry(): Entry {
    const claimEntry = Entry.newEmpty();
    let endIndex = claimEntry.elements[3].length;
    let startIndex = endIndex - this.claimType.length;
    // claim element 3 composition
    claimEntry.elements[3].fill(this.claimType, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.version.length;
    claimEntry.elements[3].fill(this.version, startIndex, endIndex);
    endIndex = startIndex;
    // claim element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this.ethKey.length;
    claimEntry.elements[2].fill(this.ethKey, startIndex, endIndex);
    endIndex = startIndex;
    startIndex = endIndex - this.ethKeyType.length;
    claimEntry.elements[2].fill(this.ethKeyType, startIndex, endIndex);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return claimEntry;
  }
}
