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
    const hiResult = '0x1d2f709deed3b20cba6218773b87fcd007bfefffc78193bfaa58b4b761f3d2a5';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0f55d2c10514bb5be610006cc9a1ff18aa4bb248856b41de516ee6d027b9463c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
