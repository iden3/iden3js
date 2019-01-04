const chai = require('chai');
const AuthorizeKSign = require('./authorize-ksign');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Authorize KSign]', () => {
  const versionExample = 1;
  const signeExample = true;
  const axExample = '0x05050505050505050505050505050506';
  const ayExample = '0x07070707070707070707070707070708';
  const ClaimAuthorizeKSign = new AuthorizeKSign.AuthorizeKSign(versionExample, signeExample, axExample, ayExample);

  const elementsFromClaim = ClaimAuthorizeKSign.elements();
  const parseClaim = AuthorizeKSign.parseFromElements(elementsFromClaim);

  it('Parse claim type', () => {
    const { claimType } = ClaimAuthorizeKSign.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parseClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = ClaimAuthorizeKSign.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parseClaim.structure.version));
  });
  it('Parse signe', () => {
    const { signe } = ClaimAuthorizeKSign.structure;
    expect(utils.bytesToHex(signe)).to.be.equal(utils.bytesToHex(parseClaim.structure.signe));
  });
  it('Parse Ax', () => {
    const { ax } = ClaimAuthorizeKSign.structure;
    expect(utils.bytesToHex(ax)).to.be.equal(utils.bytesToHex(parseClaim.structure.ax));
  });
  it('Parse Ay', () => {
    const { ay } = ClaimAuthorizeKSign.structure;
    expect(utils.bytesToHex(ay)).to.be.equal(utils.bytesToHex(parseClaim.structure.ay));
  });
  it('Extract bytes from full element', () => {
    const bytesFromElement = elementsFromClaim.bytes();
    expect(bytesFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070707070707070707070707070707080000000505050505050505050505050505050601000000015714c3724876e56d');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x18f1032141d6a2abda87e2cf053edcffb5be55ba0dc4c5a9073805c4aa7aee54';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x15331daa10ae035babcaabb76a80198bc449d32240ebb7f456ff2b03cd69bca4';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
