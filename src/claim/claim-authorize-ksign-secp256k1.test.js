// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const ethUtil = require('ethereumjs-util');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;
const { secp256k1 } = ethUtil;

describe('[Claim Authorize KSignSecp256k1]', () => {
  let entryClaim;
  let parsedClaim;
  const versionExample = 1;
  const privKeyHex = '0x79156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKeyHex);
  const pubKeyCompressedExample = secp256k1.publicKeyCreate(privKeyBuff, true);
  let claimAuthKSignSecp256k1;

  before('Create new authorizeKSignSecp256k1 claim', () => {
    claimAuthKSignSecp256k1 = new claim.AuthorizeKSignSecp256k1(utils.bytesToHex(pubKeyCompressedExample));
    claimAuthKSignSecp256k1.version = versionExample;
    expect(claimAuthKSignSecp256k1).to.not.be.equal(null);
    entryClaim = claimAuthKSignSecp256k1.toEntry();
    parsedClaim = claim.AuthorizeKSignSecp256k1.newFromEntry(entryClaim);
  });

  it('Check public key compressed', () => {
    expect(utils.bytesToHex(pubKeyCompressedExample)).to.be.equal('0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
  });

  it('Parse version', () => {
    expect(claimAuthKSignSecp256k1.version).to.be.equal(parsedClaim.version);
  });
  it('Parse public key compressed', () => {
    expect(claimAuthKSignSecp256k1.pubKeyComp.toString('hex')).to.be.equal(parsedClaim.pubKeyComp.toString('hex'));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                                       + '0000000000000000000000000000000000004d59000000010000000000000004');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x25aacb66cedd3be6248f68d61e8648ba163333070a4da17d35c424b798248440';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into claim authorize key sign secp256k1', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.pubKeyComp.toString('hex')).to.be.equal('036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
    expect(c0.version).to.be.equal(1);
  });
});
