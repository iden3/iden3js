// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const authorizeKSign = require('./authorize-ksign');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Authorize KSign]', () => {
  const versionExample = 1;
  const signExample = true;
  const ayExample = '0x0505050505050505050505050505050505050505050505050505050505050506';
  let claimAuthorizeKSign;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthorizeKSign = authorizeKSign.AuthorizeKSign.new(versionExample, signExample, ayExample);
    expect(claimAuthorizeKSign).to.not.be.equal(null);
    entryClaim = claimAuthorizeKSign.toEntry();
    parsedClaim = authorizeKSign.AuthorizeKSign.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimAuthorizeKSign.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimAuthorizeKSign.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse sign', () => {
    expect(utils.bytesToHex(claimAuthorizeKSign.sign)).to.be.equal(utils.bytesToHex(parsedClaim.sign));
  });
  it('Parse Ay', () => {
    expect(utils.bytesToHex(claimAuthorizeKSign.ay)).to.be.equal(utils.bytesToHex(parsedClaim.ay));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0505050505050505050505050505050505050505050505050505050505050506'
                                       + '0000000000000000000000000000000000000001000000010000000000000001');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x00a812462a3dbb7e6592587a242616ab61fd53236b470f0c143cd63ee59249b3';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
