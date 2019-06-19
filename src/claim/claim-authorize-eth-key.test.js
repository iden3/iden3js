// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;

describe('[Claim Authorize Ethereum Key]', () => {
  let entryClaim;
  let parsedClaim;

  const ethKey = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

  let claimAuthEthKey;

  before('Create new authorizeEthKey claim', () => {
    claimAuthEthKey = new claim.AuthorizeEthKey(ethKey, claim.ETH_KEY_TYPE.UPGRADE);
    expect(claimAuthEthKey).to.not.be.equal(null);
    entryClaim = claimAuthEthKey.toEntry();
    parsedClaim = claim.AuthorizeEthKey.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAuthEthKey.version).to.be.equal(parsedClaim.version);
  });
  it('Parse ethereum address', () => {
    expect(claimAuthEthKey.ethKey).to.be.equal(parsedClaim.ethKey);
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '000000000000000000000002e0fbce58cfaa72812103f003adce3f284fe5fc7c'
                                       + '0000000000000000000000000000000000000000000000000000000000000009');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x0718f79acd724288c56a0b7c7de9c61ad235245c64b9fb02e9de9e0a4d5d648b';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
