// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;

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
  claimType: Buffer;
  sign: Buffer;
  version: Buffer;
  ay: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, sign: Buffer, ay: Buffer) {
    this.claimType = utils.bigIntToBufferBE(bigInt(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_BABYJUB.TYPE)).slice(24, 32);
    this.version = version;
    this.sign = sign;
    this.ay = ay;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, pubKcomp: string): AuthorizeKSignBabyJub {
    const pubKcompBuff = utils.hexToBytes(pubKcomp);
    let sign = false;
    if (pubKcompBuff[0] & 0x80) {
      sign = true;
    }
    pubKcompBuff[0] &= 0x7F;
    const ayBuff = pubKcompBuff;

    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const signBuff = Buffer.alloc(1);
    signBuff.writeUInt8(sign ? 1 : 0, 0);
    return new AuthorizeKSignBabyJub(versionBuff, signBuff, ayBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSignBabyJub class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignBabyJub {
    // Parse element 3
    const versionBuff = entry.elements[3].slice(20, 24);
    const signBuff = entry.elements[3].slice(19, 20);
    // Parse element 2
    const ayBuff = entry.elements[2].slice(0, 32);
    return new AuthorizeKSignBabyJub(versionBuff, signBuff, ayBuff);
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
    startIndex = endIndex - this.sign.length;
    claimEntry.elements[3].fill(this.sign, startIndex, endIndex);
    // claim element 2 composition
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - this.ay.length;
    claimEntry.elements[2].fill(this.ay, startIndex, endIndex);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return claimEntry;
  }
}
