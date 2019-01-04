const chai = require('chai');
const SetRootKey = require('./set-root-key');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '0x393939393939393939393939393939393939393A';
  const rootKeyExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c000000000000000000000000';
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
    expect(bytesFromElement).to.be.equal('0x00000000000000000000000000000000000000000000000000000000000000000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c000000000000000000000000000000000000000000000000393939393939393939393939393939393939393a000000000000000000000000000000000000000100000001b111df93ad32c22c');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x0a2d38687ea5f987637ded13030b22d1657be60bdb35add74bb53c8d5d126f8f';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x0864f0be4ccec8241690157128b1e434d826fbf40f6a2d0ed1486c635bf845e4';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
