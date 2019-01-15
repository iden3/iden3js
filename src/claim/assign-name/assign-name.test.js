const chai = require('chai');
const Claim = require('../claim');
const assignName = require('./assign-name');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const nameExample = 'example.iden3.eth';
  const hashNameExample = utils.hashBytes(nameExample);
  hashNameExample.fill(0, 0, 1);
  const idExample = '0x393939393939393939393939393939393939393A';
  let claimAssignName;
  let entryClaim;
  let parsedClaim;

  before('Create new assign name claim', () => {
    claimAssignName = new Claim.Factory(CONSTANTS.CLAIMS.ASSIGN_NAME.ID, { version: versionExample, hashName: nameExample, id: idExample });
    expect(claimAssignName).to.not.be.equal(null);
    entryClaim = claimAssignName.createEntry();
    parsedClaim = assignName.parseAssignName(entryClaim);
  });

  it('Parse claim type', () => {
    const { claimType } = claimAssignName.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parsedClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = claimAssignName.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parsedClaim.structure.version));
  });
  it('Parse hash name', () => {
    const { hashName } = claimAssignName.structure;
    expect(utils.bytesToHex(hashName)).to.be.equal(utils.bytesToHex(parsedClaim.structure.hashName));
  });
  it('Parse id address', () => {
    const { id } = claimAssignName.structure;
    expect(utils.bytesToHex(id)).to.be.equal(utils.bytesToHex(parsedClaim.structure.id));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHexadecimal();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                                       + '0000000000000000000000000000000000000000000000010000000000000003');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x1b90afca6decbbbeb9422a441731f7c9a666b3ce15307d327f43b2c4506fe29c';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x19ff0e5ed571621bbc36bf4c0027dbe097975e11c03841b8c8d773b833b71f84';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
