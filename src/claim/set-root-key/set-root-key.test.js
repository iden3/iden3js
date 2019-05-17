// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const setRootKey = require('./set-root-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  const rootKeyExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
  let claimSetRootKey;
  let entryClaim;
  let parsedClaim;

  before('Create new set root claim', () => {
    claimSetRootKey = setRootKey.SetRootKey.new(versionExample, eraExample, idExample, rootKeyExample);
    expect(claimSetRootKey).to.not.be.equal(null);
    entryClaim = claimSetRootKey.toEntry();
    parsedClaim = setRootKey.SetRootKey.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimSetRootKey.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimSetRootKey.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse era', () => {
    expect(utils.bytesToHex(claimSetRootKey.era)).to.be.equal(utils.bytesToHex(parsedClaim.era));
  });
  it('Parse id address', () => {
    expect(utils.bytesToHex(claimSetRootKey.id)).to.be.equal(utils.bytesToHex(parsedClaim.id));
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
});
