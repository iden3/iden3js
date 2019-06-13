// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');
const { utilsBabyJub } = require('../crypto/crypto');

const { expect } = chai;

describe('[Claim Authorize KSign Babyjubjub]', () => {
  const versionExample = 1;
  const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKey);
  const pubKeyBuff = utilsBabyJub.privToPub(privKeyBuff, true);

  let claimAuthKSignBabyJub;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthKSignBabyJub = new claim.AuthorizeKSignBabyJub(utils.bytesToHex(pubKeyBuff));
    claimAuthKSignBabyJub.version = versionExample;
    expect(claimAuthKSignBabyJub).to.not.be.equal(null);
    entryClaim = claimAuthKSignBabyJub.toEntry();
    parsedClaim = claim.AuthorizeKSignBabyJub.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAuthKSignBabyJub.version).to.be.equal(parsedClaim.version);
  });
  it('Parse sign', () => {
    expect(claimAuthKSignBabyJub.sign).to.be.equal(parsedClaim.sign);
  });
  it('Parse Ay', () => {
    expect(claimAuthKSignBabyJub.ay.toString('hex')).to.be.equal(parsedClaim.ay.toString('hex'));
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
  it('Parse entry into claim authorize key sign babyjub', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.sign).to.be.equal(true);
    expect(c0.ay.toString('hex')).to.be.equal('2b05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c');
  });
});
