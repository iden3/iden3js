const chai = require('chai');
const Claim = require('../claim');
const basic = require('./basic');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

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
    claimBasic = new Claim.Factory(CONSTANTS.CLAIMS.BASIC.ID, {
      version: versionExample, index: utils.bytesToHex(indexExample), extraData: utils.bytesToHex(dataExample),
    });
    expect(claimBasic).to.not.be.equal(null);
    entryClaim = claimBasic.createEntry();
    parsedClaim = basic.parseBasicClaim(entryClaim);
  });

  it('Parse claim type', () => {
    const { claimType } = claimBasic.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parsedClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = claimBasic.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parsedClaim.structure.version));
  });
  it('Parse index slot', () => {
    const { index } = claimBasic.structure;
    expect(utils.bytesToHex(index)).to.be.equal(utils.bytesToHex(parsedClaim.structure.index));
  });
  it('Parse extra data slot', () => {
    const { extraData } = claimBasic.structure;
    expect(utils.bytesToHex(extraData)).to.be.equal(utils.bytesToHex(parsedClaim.structure.extraData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHexadecimal();
    expect(hexFromElement).to.be.equal('0x0056585858585858585858585858585858585858585858585858585858585858'
                                       + '0058585858585858585858585858585858585858585858585858585858585859'
                                       + '00292a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
                                       + '002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2b000000010000000000000000');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x10dae586534145cf6bf10cb0f7dc7f0a343b6fb32c04501e85cace56c9381f73';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x00fa98173f610358b765b4ff593ed7bae0db326d287eec86b1782da9bea45748';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
