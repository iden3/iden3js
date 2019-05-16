// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const authorizeKSignBabyJub = require('./authorize-ksign-babyjub');
const utils = require('../../utils');
const { utilsBabyJub } = require('../../crypto/crypto');

const { expect } = chai;

describe('[Claim Authorize KSign Babyjubjub]', () => {
  const versionExample = 1;
  const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKey);
  const pubKeyBuff = utilsBabyJub.privToPub(privKeyBuff, true);
  let sign = false;
  if (pubKeyBuff[0] & 0x80) {
    sign = true;
  }
  pubKeyBuff[0] &= 0x7F;
  let AuthorizeKSignBabyJub;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    AuthorizeKSignBabyJub = authorizeKSignBabyJub.AuthorizeKSignBabyJub.new(versionExample, sign, utils.bytesToHex(pubKeyBuff));
    expect(AuthorizeKSignBabyJub).to.not.be.equal(null);
    entryClaim = AuthorizeKSignBabyJub.toEntry();
    parsedClaim = authorizeKSignBabyJub.AuthorizeKSignBabyJub.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(AuthorizeKSignBabyJub.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(AuthorizeKSignBabyJub.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse sign', () => {
    expect(utils.bytesToHex(AuthorizeKSignBabyJub.sign)).to.be.equal(utils.bytesToHex(parsedClaim.sign));
  });
  it('Parse Ay', () => {
    expect(utils.bytesToHex(AuthorizeKSignBabyJub.ay)).to.be.equal(utils.bytesToHex(parsedClaim.ay));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '2b05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c'
                                       + '0000000000000000000000000000000000000001000000010000000000000001');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x04f41fdac3240e7b68905df19a2394e4a4f1fb7eaeb310e39e1bb0b225b7763f';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
