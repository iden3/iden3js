// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const setRootKey = require('./set-root-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '0x393939393939393939393939393939393939393A';
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
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '0000000000000000000000000000000000000001000000010000000000000002');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x294f519cc92c64c68bb78df0d39ff5a67af9a2db26d6b9df2a977ab56e84ca4d';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x01705b25f2cf7cda34d836f09e9b0dd1777bdc16752657cd9d1ae5f6286525ba';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
