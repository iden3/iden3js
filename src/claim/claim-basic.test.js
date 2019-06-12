// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;

describe('[Claim Basic]', () => {
  const versionExample = 1;
  const indexExample = Buffer.alloc(50);
  indexExample.fill(41, 0, 1);
  indexExample.fill(42, 1, 49);
  indexExample.fill(43, 49, 50);
  const dataExample = Buffer.alloc(62);
  dataExample.fill(86, 0, 1);
  dataExample.fill(88, 1, 61);
  dataExample.fill(89, 61, 62);
  let claimBasic;
  let entryClaim;
  let parsedClaim;

  before('Create new basic claim', () => {
    claimBasic = new claim.Basic(indexExample, dataExample);
    claimBasic.version = versionExample;
    expect(claimBasic).to.not.be.equal(null);
    entryClaim = claimBasic.toEntry();
    parsedClaim = claim.Basic.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimBasic.version).to.be.equal(parsedClaim.version);
  });
  it('Parse index slot', () => {
    expect(utils.bytesToHex(claimBasic.index)).to.be.equal(utils.bytesToHex(parsedClaim.index));
  });
  it('Parse extra data slot', () => {
    expect(utils.bytesToHex(claimBasic.extraData)).to.be.equal(utils.bytesToHex(parsedClaim.extraData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0056585858585858585858585858585858585858585858585858585858585858'
                                       + '0058585858585858585858585858585858585858585858585858585858585859'
                                       + '00292a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
                                       + '002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2b000000010000000000000000');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x1d4d6c81f3cd8bd286affa0d5ac3b677d86fea34ba88d450081d703bcf712e6a';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x03c4686d099ffd137b83ba22b57dc954ac1e6c0e2b1e0ef972a936992b8788ff';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into basic claim', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(utils.bytesToHex(c0.index)).to.be.equal(utils.bytesToHex(indexExample));
    expect(utils.bytesToHex(c0.extraData)).to.be.equal(utils.bytesToHex(dataExample));
  });
});
