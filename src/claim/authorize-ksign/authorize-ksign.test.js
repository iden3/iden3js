const chai = require('chai');
const Claim = require('../claim');
const AuthorizeKSign = require('./authorize-ksign');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { expect } = chai;

describe('[Claim Authorize KSign]', () => {
  const versionExample = 1;
  const signExample = true;
  const axExample = '0x05050505050505050505050505050506';
  const ayExample = '0x07070707070707070707070707070708';
  let claimAuthorizeKSign;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthorizeKSign = new Claim.Factory(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN.ID, {
      version: versionExample, sign: signExample, ax: axExample, ay: ayExample,
    });
    expect(claimAuthorizeKSign).to.not.be.equal(null);
    entryClaim = claimAuthorizeKSign.createEntry();
    parsedClaim = AuthorizeKSign.parseAuthorizeKSign(entryClaim);
  });

  it('Parse claim type', () => {
    const { claimType } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parsedClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parsedClaim.structure.version));
  });
  it('Parse sign', () => {
    const { sign } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(sign)).to.be.equal(utils.bytesToHex(parsedClaim.structure.sign));
  });
  it('Parse Ax', () => {
    const { ax } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(ax)).to.be.equal(utils.bytesToHex(parsedClaim.structure.ax));
  });
  it('Parse Ay', () => {
    const { ay } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(ay)).to.be.equal(utils.bytesToHex(parsedClaim.structure.ay));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHexadecimal();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                         + '0000000000000000000000000000000000000000000000000000000000000000'
                                         + '0000000000000000000000000000000007070707070707070707070707070708'
                                         + '0000000505050505050505050505050505050601000000015714c3724876e56d');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x18f1032141d6a2abda87e2cf053edcffb5be55ba0dc4c5a9073805c4aa7aee54';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x15331daa10ae035babcaabb76a80198bc449d32240ebb7f456ff2b03cd69bca4';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
