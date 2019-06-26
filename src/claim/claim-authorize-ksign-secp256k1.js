// @flow
import { Entry } from './entry';

const utils = require('../utils');
const claimUtils = require('./claim-utils');

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
  version: number;
  pubKeyComp: Buffer;

  /**
   * Initialize claim data structure from fields
   */
  constructor(pubKeyCompHex: string | Buffer) {
    if (pubKeyCompHex instanceof Buffer) {
      claimUtils.checkByteLen(pubKeyCompHex, 33);
      this.pubKeyComp = pubKeyCompHex;
    } else {
      const pubKeyCompBuff = utils.hexToBytes(pubKeyCompHex);
      claimUtils.checkByteLen(pubKeyCompBuff, 33);
      this.pubKeyComp = pubKeyCompBuff;
    }
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSign class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignSecp256k1 {
    // Parse element 3
    const { version } = claimUtils.getClaimTypeVersion(entry);
    // Parse element 3 and element 2
    const pubKeyCompBuf = Buffer.concat(
      [claimUtils.getElemBuf(entry.elements[2], 0, 31), claimUtils.getElemBuf(entry.elements[3], 8 + 4, 2)],
    );
    const claim = new AuthorizeKSignSecp256k1(pubKeyCompBuf);
    claim.version = version;
    return claim;
  }

  /**
   * Code raw data claim object into an entry claim object
   * @returns {Object} Element representation of the claim
   */
  toEntry(): Entry {
    const entry = Entry.newEmpty();
    // claim element 3 composition
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.AUTHORIZE_KSIGN_SECP256K1.TYPE, this.version);
    claimUtils.copyToElemBuf(entry.elements[3], 8 + 4, this.pubKeyComp.slice(this.pubKeyComp.length - 2));
    // claim element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, this.pubKeyComp.slice(0, this.pubKeyComp.length - 2));
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}
