const chai = require('chai');
const SetRootKey = require('./set-root-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim SetRootKey]', () => {
  const versionExample = 0;
  const eraExample = 0;
  const idExample = '0x3939393939393939393939393939393939393939';
  const rootKeyExample = Buffer.alloc(32);
  rootKeyExample.fill(11, 1, 21, 'hex');
  const ClaimSetRootKey = new SetRootKey.SetRootKey(versionExample, eraExample, idExample, rootKeyExample);

  const elementsFromClaim = ClaimSetRootKey.elements();
  const parseClaim = SetRootKey.parseFromElements(elementsFromClaim);

  it('Parse claim type', () => {
    const { claimType } = ClaimSetRootKey.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parseClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = ClaimSetRootKey.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parseClaim.structure.version));
  });
  it('Parse era', () => {
    const { era } = ClaimSetRootKey.structure;
    expect(utils.bytesToHex(era)).to.be.equal(utils.bytesToHex(parseClaim.structure.era));
  });
  it('Parse id address', () => {
    const { id } = ClaimSetRootKey.structure;
    expect(utils.bytesToHex(id)).to.be.equal(utils.bytesToHex(parseClaim.structure.id));
  });
  it('Parse rootKey', () => {
    const { rootKey } = ClaimSetRootKey.structure;
    expect(utils.bytesToHex(rootKey)).to.be.equal(utils.bytesToHex(parseClaim.structure.rootKey));
  });
  it('Extract bytes from full element', () => {
    const bytesFromElement = elementsFromClaim.bytes();
    expect(bytesFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b000000000000000000000000003939393939393939393939393939393900000000000000000000000000000000000000000000000000000000e400a1345fb8a750');
  });
  /*
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = ;
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = ;
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  */
});
