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

  before('Create new assign name claim', () => {
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
    const hiResult = '0x0f92abb8209409736929512c2018467a497ed35f409bb90579c62b9a4e0b2aa8';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0ad7edbf562757b1ad2282c44e2c248f95e9e6b09ba0d32809aa724fbf148e0c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
