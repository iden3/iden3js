const chai = require('chai');
const SetRootKey = require('./set-root-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '0x393939393939393939393939393939393939393A';
  const rootKeyExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
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
    expect(bytesFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                         + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                         + '000000000000000000000000393939393939393939393939393939393939393a'
                                         + '000000000000000000000000000000000000000100000001b111df93ad32c22c');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x0a2d38687ea5f987637ded13030b22d1657be60bdb35add74bb53c8d5d126f8f';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x2e27903d404fcab9363967a4ffe7da6a615f9ce6f55c43661a0297a040d336a4';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});