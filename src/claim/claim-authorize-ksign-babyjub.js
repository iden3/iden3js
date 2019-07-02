// @flow
import { Entry } from './entry';

const utils = require('../utils');
const claimUtils = require('./claim-utils');

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
  sign: boolean;
  version: number;
  ay: Buffer;

  /**
   * Initialize claim data structure from fields
   * pubKComp is in little endian
   */
  constructor(pubKComp: string) {
    const pubKCompBuf = utils.swapEndianness(utils.hexToBytes(pubKComp));
    claimUtils.checkByteLen(pubKCompBuf, 32);
    this.sign = (pubKCompBuf[0] & 0x80) !== 0;
    pubKCompBuf[0] &= 0x7F;
    this.ay = pubKCompBuf;
    this.version = 0;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeKSignBabyJub class object
  */
  static newFromEntry(entry: Entry): AuthorizeKSignBabyJub {
    // Parse element 3
    const { version } = claimUtils.getClaimTypeVersion(entry);
    // Parse element 2
    let ay = Buffer.from(claimUtils.getElemBuf(entry.elements[2], 0, 32));
    const sign = claimUtils.getElemBuf(entry.elements[3], 8 + 4, 1)[0] !== 0;
    ay[0] |= sign ? 0x80 : 0x00;
    ay = utils.swapEndianness(ay);
    const claim = new AuthorizeKSignBabyJub(ay.toString('hex'));
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.AUTHORIZE_KSIGN_BABYJUB.TYPE, this.version);
    claimUtils.copyToElemBuf(entry.elements[3], 8 + 4, Buffer.from([this.sign ? 1 : 0]));
    // claim element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, this.ay);
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}
