// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');
const eddsa = require('../crypto/eddsa-babyjub.js');

const { expect } = chai;

describe('[Claim Authorize KSign Babyjubjub]', () => {
  const versionExample = 1;
  const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const sk = new eddsa.PrivateKey(utils.hexToBytes(privKey));
  const pk = sk.public();

  const pubKey = pk.toString();
  let claimAuthKSignBabyJub;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthKSignBabyJub = new claim.AuthorizeKSignBabyJub(pubKey);
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
                                       + '2d9e82263b94a343ee95d56c810a5a0adb63a439cd5b4944dfb56f09e28c6f04'
                                       + '0000000000000000000000000000000000000001000000010000000000000001');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2e962176e9f24e72f689da23361ad939f04417932fb0cb3d973f2cad04fe5048';
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
    expect(c0.ay.toString('hex')).to.be.equal('2d9e82263b94a343ee95d56c810a5a0adb63a439cd5b4944dfb56f09e28c6f04');
  });
});
