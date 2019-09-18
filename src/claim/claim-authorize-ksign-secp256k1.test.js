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
    const hiResult = '0x2a65c16ad6d4333877bb94e1753ef79f54b694771a8e46e3c67c1cc59e76985e';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x021a76d5f2cdcf354ab66eff7b4dee40f02501545def7bb66b3502ae68e1b781';
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
