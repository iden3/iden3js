// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;

describe('[Claim link object identity Id]', () => {
  const versionExample = 1;
  const objectTypeExample = 1;
  const objectIndexExample = 0;
  const hashObjectExample = utils.hexToBytes('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  const auxDataExample = utils.hexToBytes('0x0102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102');
  let claimLinkObject;
  let entryClaim;
  let parsedClaim;

  before('Create new unique id claim', () => {
    claimLinkObject = new claim.LinkObjectIdentity(
      objectTypeExample, objectIndexExample, idExample, hashObjectExample, auxDataExample,
    );
    claimLinkObject.version = versionExample;
    expect(claimLinkObject).to.not.be.equal(null);
    entryClaim = claimLinkObject.toEntry();
    parsedClaim = claim.LinkObjectIdentity.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimLinkObject.version).to.be.equal(parsedClaim.version);
  });
  it('Parse object type', () => {
    expect(claimLinkObject.objectType).to.be.equal(parsedClaim.objectType);
  });
  it('Parse object index', () => {
    expect(claimLinkObject.objectIndex).to.be.equal(parsedClaim.objectIndex);
  });
  it('Parse identity address', () => {
    expect(claimLinkObject.id).to.be.equal(parsedClaim.id);
  });
  it('Parse object hash identifier', () => {
    expect(utils.bytesToHex(claimLinkObject.objectHash)).to.be.equal(utils.bytesToHex(parsedClaim.objectHash));
  });
  it('Parse auxiliary data', () => {
    expect(utils.bytesToHex(claimLinkObject.auxData)).to.be.equal(utils.bytesToHex(parsedClaim.auxData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x000102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102'
                                       + '000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '0000000000000000000000000000000000000001000000010000000000000005');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2dc73c37e603a15f8f028aa5c3f668d1210c86008577188ce279ead60a9afec4';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0f55d2c10514bb5be610006cc9a1ff18aa4bb248856b41de516ee6d027b9463c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
