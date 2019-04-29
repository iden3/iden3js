// @flow
import { Entry } from '../entry/entry';

const snarkjs = require('snarkjs');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { bigInt } = snarkjs;

/**
 * Class representing an authorized Ksign claim with elliptic curve as secp256k1
 * This claim aims to use ethereum public key until zkSnarks are implemented using a Jubjub curve
 * Authorized KsignSecp256k1 claim is used to authorize a public key that belongs to elliptic curve secp256k1 for being used afterwards
 * Authorized KsignSecp256k1 element representation is as follows:
 * |element 3|: |empty|public key[0]|version|claim type| - |18 bytes|2 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|public key[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
export class AuthorizeKSignSecp256k1 {
  claimType: Buffer;
  version: Buffer;
  pubKeyCompressed: Buffer;

  /**
   * Initialize raw claim data structure
   * Bytes are taken according element claim structure
   * Claim type is used to define this concrete claim. This parameter takes 8 bytes.
   */
  constructor(version: Buffer, pubKeyCompressed: Buffer) {
    this.claimType = utils.bigIntToBuffer(bigInt(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.TYPE)).slice(24, 32);
    this.version = version;
    this.pubKeyCompressed = pubKeyCompressed;
  }

  /**
   * Initialize claim data structure from fields
   */
  static new(version: number, pubKeyCompressed: string): AuthorizeKSignSecp256k1 {
    const versionBuff = Buffer.alloc(4);
    versionBuff.writeUInt32BE(version, 0);
    const pubKeyCompressedBuff = utils.hexToBytes(pubKeyCompressed);
    return new AuthorizeKSignSecp256k1(versionBuff, pubKeyCompressedBuff);
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSign class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignSecp256k1 {
    // Parse element 3
    const versionBuff = entry.elements[3].slice(20, 24);
    // Parse element 3 and element 2
    const pubKeyCompressedBuff = Buffer.concat([entry.elements[2].slice(1, 32), entry.elements[3].slice(18, 20)]);
    return new AuthorizeKSignSecp256k1(versionBuff, pubKeyCompressedBuff);
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
    const indexLen = this.pubKeyCompressed.length;
    const firstSlotPubKey = this.pubKeyCompressed.slice(indexLen - 2, indexLen);
    endIndex = startIndex;
    startIndex = endIndex - firstSlotPubKey.length;
    claimEntry.elements[3].fill(firstSlotPubKey, startIndex, endIndex);
    // claim element 2 composition
    const secondSlotPubKey = this.pubKeyCompressed.slice(0, indexLen - 2);
    endIndex = claimEntry.elements[2].length;
    startIndex = claimEntry.elements[2].length - secondSlotPubKey.length;
    claimEntry.elements[2].fill(secondSlotPubKey, startIndex, endIndex);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return claimEntry;
  }
}
