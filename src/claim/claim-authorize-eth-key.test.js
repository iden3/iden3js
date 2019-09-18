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
    const hiResult = '0x0ce27cf2190dfa6ee36276e79335942c28a08dbc5ef8c564ed2f337d5c85b666';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x021a76d5f2cdcf354ab66eff7b4dee40f02501545def7bb66b3502ae68e1b781';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
