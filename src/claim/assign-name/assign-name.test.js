const chai = require('chai');
const AssignName = require('./assign-name');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const hashNameExample = '0x0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0b000000000000000000000000';
  const idExample = '0x393939393939393939393939393939393939393A';
  const ClaimAssignName = new AssignName.AssignName(versionExample, hashNameExample, idExample);

  const elementsFromClaim = ClaimAssignName.elements();
  const parseClaim = AssignName.parseFromElements(elementsFromClaim);

  it('Parse claim type', () => {
    const { claimType } = ClaimAssignName.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parseClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = ClaimAssignName.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parseClaim.structure.version));
  });
  it('Parse hash name', () => {
    const { hashName } = ClaimAssignName.structure;
    expect(utils.bytesToHex(hashName)).to.be.equal(utils.bytesToHex(parseClaim.structure.hashName));
  });
  it('Parse id address', () => {
    const { id } = ClaimAssignName.structure;
    expect(utils.bytesToHex(id)).to.be.equal(utils.bytesToHex(parseClaim.structure.id));
  });
  it('Extract bytes from full element', () => {
    const bytesFromElement = elementsFromClaim.bytes();
    expect(bytesFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000393939393939393939393939393939393939393ab3ca9e5e0a3d6845cf0f1be899e8ca1b57036916ae4d784e7e84ff89bfa86eb4000000000000000000000000000000000000000000000001f60d928459d792ed');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x15891bd6f6d1f72dfa74997cc92ef1cf51f2dfb40e3f9ceeac51435a009c4d67';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x279689e54ed1540614ba9ca682a01e83eb8b6aa3abf85b1f659fd537a75c5d6a';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
