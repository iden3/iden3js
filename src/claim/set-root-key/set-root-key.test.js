const chai = require('chai');
const Claim = require('../claim');
const setRootKey = require('./set-root-key');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '0x393939393939393939393939393939393939393A';
  const rootKeyExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
  let claimSetRootKey;
  let entryClaim;
  let parsedClaim;

  before('Create new assign name claim', () => {
    claimSetRootKey = new Claim.Factory(CONSTANTS.CLAIMS.SET_ROOT_KEY.ID, {
      version: versionExample, era: eraExample, id: idExample, rootKey: rootKeyExample,
    });
    expect(claimSetRootKey).to.not.be.equal(null);
    entryClaim = claimSetRootKey.createEntry();
    parsedClaim = setRootKey.parseSetRootKey(entryClaim);
  });

  it('Parse claim type', () => {
    const { claimType } = claimSetRootKey.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parsedClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = claimSetRootKey.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parsedClaim.structure.version));
  });
  it('Parse era', () => {
    const { era } = claimSetRootKey.structure;
    expect(utils.bytesToHex(era)).to.be.equal(utils.bytesToHex(parsedClaim.structure.era));
  });
  it('Parse id address', () => {
    const { id } = claimSetRootKey.structure;
    expect(utils.bytesToHex(id)).to.be.equal(utils.bytesToHex(parsedClaim.structure.id));
  });
  it('Parse rootKey', () => {
    const { rootKey } = claimSetRootKey.structure;
    expect(utils.bytesToHex(rootKey)).to.be.equal(utils.bytesToHex(parsedClaim.structure.rootKey));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHexadecimal();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '0000000000000000000000000000000000000001000000010000000000000002');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x1c0f4440c0c64f4fcf67c780012592435223e3053a28c6281d6e9d1a7c0f12a3';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x13c1515996ee7a147f13c1429b9df006fc513541caf8ef7e39c8c6f647497b2f';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
