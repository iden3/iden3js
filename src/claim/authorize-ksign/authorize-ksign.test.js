const chai = require('chai');
const Claim = require('../claim');
const authorizeKSign = require('./authorize-ksign');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { expect } = chai;

describe('[Claim Authorize KSign]', () => {
  const versionExample = 1;
  const signExample = true;
  const ayExample = '0x0505050505050505050505050505050505050505050505050505050505050506';
  let claimAuthorizeKSign;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthorizeKSign = new Claim.Factory(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN.ID, {
      version: versionExample, sign: signExample, ay: ayExample,
    });
    expect(claimAuthorizeKSign).to.not.be.equal(null);
    entryClaim = claimAuthorizeKSign.createEntry();
    parsedClaim = authorizeKSign.parseAuthorizeKSign(entryClaim);
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
  it('Parse Ay', () => {
    const { ay } = claimAuthorizeKSign.structure;
    expect(utils.bytesToHex(ay)).to.be.equal(utils.bytesToHex(parsedClaim.structure.ay));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHexadecimal();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0505050505050505050505050505050505050505050505050505050505050506'
                                       + '0000000000000000000000000000000000000001000000010000000000000001');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2933b00c626c11d1dacadc6bbfbbdd7d008efb3db3565fbadc9dadfc8ac57eff';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
