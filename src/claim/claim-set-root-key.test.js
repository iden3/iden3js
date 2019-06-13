// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  const rootKeyExample = utils.hexToBytes('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  let claimSetRootKey;
  let entryClaim;
  let parsedClaim;

  before('Create new set root claim', () => {
    claimSetRootKey = new claim.SetRootKey(idExample, rootKeyExample);
    claimSetRootKey.version = versionExample;
    claimSetRootKey.era = eraExample;
    expect(claimSetRootKey).to.not.be.equal(null);
    entryClaim = claimSetRootKey.toEntry();
    parsedClaim = claim.SetRootKey.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimSetRootKey.version).to.be.equal(parsedClaim.version);
  });
  it('Parse era', () => {
    expect(claimSetRootKey.era).to.be.equal(parsedClaim.era);
  });
  it('Parse id address', () => {
    expect(claimSetRootKey.id).to.be.equal(parsedClaim.id);
  });
  it('Parse rootKey', () => {
    expect(utils.bytesToHex(claimSetRootKey.rootKey)).to.be.equal(utils.bytesToHex(parsedClaim.rootKey));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '0000000000000000000000000000000000000001000000010000000000000002');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x12bf59ff4171debe81321c04a52298e62650ca8514e9a7a8a64c23cb55eeaa2e';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x01705b25f2cf7cda34d836f09e9b0dd1777bdc16752657cd9d1ae5f6286525ba';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into claim set root key', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.era).to.be.equal(1);
    expect(c0.id).to.be.equal('1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z');
    expect(utils.bytesToHex(c0.rootKey)).to.be.equal('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  });
});
