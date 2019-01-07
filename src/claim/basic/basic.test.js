const chai = require('chai');
const Basic = require('./basic');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const indexExample = Buffer.alloc(50);
  indexExample.fill(41, 0, 1);
  indexExample.fill(42, 1, 49);
  indexExample.fill(43, 49, 50);
  const dataExample = Buffer.alloc(62);
  dataExample.fill(86, 0, 1);
  dataExample.fill(88, 1, 61);
  dataExample.fill(89, 61, 62);
  const ClaimBasic = new Basic.Basic(versionExample, utils.bytesToHex(indexExample), utils.bytesToHex(dataExample));

  const elementsFromClaim = ClaimBasic.elements();
  const parseClaim = Basic.parseFromElements(elementsFromClaim);

  it('Parse claim type', () => {
    const { claimType } = ClaimBasic.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parseClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = ClaimBasic.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parseClaim.structure.version));
  });
  it('Parse index slot', () => {
    const { index } = ClaimBasic.structure;
    expect(utils.bytesToHex(index)).to.be.equal(utils.bytesToHex(parseClaim.structure.index));
  });
  it('Parse data slot', () => {
    const { data } = ClaimBasic.structure;
    expect(utils.bytesToHex(data)).to.be.equal(utils.bytesToHex(parseClaim.structure.data));
  });
  it('Extract bytes from full element', () => {
    const bytesFromElement = elementsFromClaim.bytes();
    expect(bytesFromElement).to.be.equal('0x0056585858585858585858585858585858585858585858585858585858585858'
                                         + '0058585858585858585858585858585858585858585858585858585858585859'
                                         + '00292a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
                                         + '002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2b000000015735944c6eb8f12d');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x0d1770cf7af29da78eb31086bfa35a5945f39a8c4fa35edee71ac12a75b4a30b';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x14869ce50566e440424a2571816b117d88a2e5e3d10a0abb7f89a89032b9e07f';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
