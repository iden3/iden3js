// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const linkObjectIdentity = require('./link-object-identity');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim link object identity Id]', () => {
  const versionExample = 1;
  const hashTypeExample = 1;
  const objectTypeExample = 1;
  const objectIndexExample = 0;
  const hashObjectExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
  const idAddrExample = '0x393939393939393939393939393939393939393A';
  let claimLinkObject;
  let entryClaim;
  let parsedClaim;

  before('Create new unique id claim', () => {
    claimLinkObject = linkObjectIdentity.LinkObjectIdentity.new(
      versionExample, hashTypeExample, objectTypeExample, objectIndexExample, idAddrExample, hashObjectExample,
    );
    expect(claimLinkObject).to.not.be.equal(null);
    entryClaim = claimLinkObject.toEntry();
    parsedClaim = linkObjectIdentity.LinkObjectIdentity.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimLinkObject.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimLinkObject.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse hash type', () => {
    expect(utils.bytesToHex(claimLinkObject.hashType)).to.be.equal(utils.bytesToHex(parsedClaim.hashType));
  });
  it('Parse object type', () => {
    expect(utils.bytesToHex(claimLinkObject.objectType)).to.be.equal(utils.bytesToHex(parsedClaim.objectType));
  });
  it('Parse object index', () => {
    expect(utils.bytesToHex(claimLinkObject.objectIndex)).to.be.equal(utils.bytesToHex(parsedClaim.objectIndex));
  });
  it('Parse object hash identifier', () => {
    expect(utils.bytesToHex(claimLinkObject.objectHash)).to.be.equal(utils.bytesToHex(parsedClaim.objectHash));
  });
  it('Parse identity address', () => {
    expect(utils.bytesToHex(claimLinkObject.idAddr)).to.be.equal(utils.bytesToHex(parsedClaim.idAddr));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000001'
                                       + '000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '0000000000000000000000000000000000000001000000010000000000000005');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2180103fca164a1f4afe33b610f8573076a24de6d7ca3d20fcf62540d3c73338';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x1bc5fac04887744f1831a8d881e4d68330e9f5f60a1c85265896df294329c7cc';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
