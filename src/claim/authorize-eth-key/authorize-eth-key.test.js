// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const authorizeEthKey = require('./authorize-eth-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Authorize KSignSecp256k1]', () => {
  let entryClaim;
  let parsedClaim;

  const ethKeyStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

  let claimAuthEthKey;

  before('Create new authorizeEthKey claim', () => {
    claimAuthEthKey = authorizeEthKey.AuthorizeEthKey.new(0, ethKeyStr, 2);
    expect(claimAuthEthKey).to.not.be.equal(null);
    entryClaim = claimAuthEthKey.toEntry();
    parsedClaim = authorizeEthKey.AuthorizeEthKey.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimAuthEthKey.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimAuthEthKey.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse public key compressed', () => {
    expect(utils.bytesToHex(claimAuthEthKey.ethKey)).to.be.equal(utils.bytesToHex(parsedClaim.ethKey));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e0fbce58cfaa72812103f003adce3f284fe5fc7c0000000000000000000000000000000000000000000000000000000000000009');
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
