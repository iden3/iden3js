// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const linkObjectIdentity = require('./link-object-identity');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim link object identity Id]', () => {
  const versionExample = 1;
  const objectTypeExample = 1;
  const objectIndexExample = 0;
  const hashObjectExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
  const idAddrExample = '0x393939393939393939393939393939393939393A';
  const auxDataExample = '0x000102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102';
  let claimLinkObject;
  let entryClaim;
  let parsedClaim;

  before('Create new unique id claim', () => {
    claimLinkObject = linkObjectIdentity.LinkObjectIdentity.new(
      versionExample, objectTypeExample, objectIndexExample, idAddrExample, hashObjectExample, auxDataExample,
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
  it('Parse auxiliary data', () => {
    expect(utils.bytesToHex(claimLinkObject.auxData)).to.be.equal(utils.bytesToHex(parsedClaim.auxData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x000102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102'
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
    const hvResult = '0x29b6b6df525047ada442f0db2fd2a3b74e0cb3f6bed89709d5cd72d69c5a135c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
