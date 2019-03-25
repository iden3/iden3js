// @flow
import { describe, it } from 'mocha';
import { Entry } from './entry/entry';

const chai = require('chai');
const claimUtils = require('./claim-utils');
const claim = require('./claim');

const { expect } = chai;

describe('[claim-utils]', () => {
  it('Increment claim version', () => {
    // hardcode entry
    const versionHardcoded = 1;
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                     + '0000000000000000000000000000000000004d59000000010000000000000004';
    const entry = Entry.newFromHex(entryHex);
    // increase version
    claimUtils.incClaimVersion(entry);
    const claimExample = claim.newClaimFromEntry(entry);
    expect(claimExample).to.be.not.equal(undefined);
    if (claimExample == null) { return; }
    const versionInc = claimExample.version;
    expect((versionInc).readUInt32BE(0)).to.be.equal(versionHardcoded + 1);
  });
});
