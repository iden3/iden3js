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
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '0000000000000000000000000000000100000001000000010000000000000002');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x18e5cd328f663ceefb0ca1752a3981356145ef8116fabb9ad9198b91b44188f6';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0ad7edbf562757b1ad2282c44e2c248f95e9e6b09ba0d32809aa724fbf148e0c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
