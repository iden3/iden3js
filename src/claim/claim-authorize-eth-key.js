// @flow
import { Entry } from './entry';

const utils = require('../utils');
const claimUtils = require('./claim');

export class AuthorizeEthKey {
  version: number;
  ethKey: string;
  ethKeyType: number;

  /**
   * Initialize claim data structure from fields
   */
  constructor(ethKey: string, ethKeyType: number) {
    this.version = 0;
    this.ethKey = ethKey;
    this.ethKeyType = ethKeyType;
  }

  /**
  * Decode field claim structure into raw data claim structure
  * @param {Object} entry - Element representation of the claim
  * @returns {Object} AuthorizeEthKey class object
  */
  static newFromEntry(entry: Entry): AuthorizeEthKey {
    // Parse element 3
    const { version } = claimUtils.getClaimTypeVersion(entry);
    // Parse element 2
    const ethKey = `0x${claimUtils.getElemBuf(entry.elements[2], 0, 20).toString('hex')}`;
    const ethKeyType = claimUtils.buf2num(claimUtils.getElemBuf(entry.elements[2], 20, 4));
    const claim = new AuthorizeEthKey(ethKey, ethKeyType);
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
    claimUtils.setClaimTypeVersion(entry, claimUtils.CLAIMTYPES.AUTHORIZE_ETH_KEY.TYPE, this.version);
    // claim element 2 composition
    claimUtils.copyToElemBuf(entry.elements[2], 0, utils.hexToBytes(this.ethKey));
    claimUtils.copyToElemBuf(entry.elements[2], 20, claimUtils.num2buf(this.ethKeyType));
    // claim element 1 remains as empty value
    // claim element 0 remains as empty value
    return entry;
  }
}
