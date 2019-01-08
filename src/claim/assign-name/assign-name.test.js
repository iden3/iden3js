const chai = require('chai');
const Claim = require('../claim');
const utils = require('../../utils');
const CONSTANTS = require('../../constants');

const { expect } = chai;

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const nameExample = 'example.iden3.eth';
  const hashNameExample = utils.hashBytes(nameExample);
  hashNameExample.fill(0, 0, 1);
  const idExample = '0x393939393939393939393939393939393939393A';
  let assignNameClaim;

  let elementsFromClaim;
  let parsedClaim;
  // Crear test del claim pero con valores que no van bien y check de que retorne 'null'
  // Crear test del claim sin 'data' y ver que los valores sean los de default
  before('Create new assign name claim', () => {
    assignNameClaim = new Claim.Factory(CONSTANTS.CLAIMS.ASSIGN_NAME.ID, { version: versionExample, nameExample, idExample });
    expect(assignNameClaim).not.to.be(null);
    elementsFromClaim = assignNameClaim.createEntry();
    parsedClaim = Claim.parseAssignName(elementsFromClaim);
  });

  it('Parse claim type', () => {
    const { claimType } = assignNameClaim.structure;
    expect(utils.bytesToHex(claimType)).to.be.equal(utils.bytesToHex(parsedClaim.structure.claimType));
  });
  it('Parse version', () => {
    const { version } = assignNameClaim.structure;
    expect(utils.bytesToHex(version)).to.be.equal(utils.bytesToHex(parsedClaim.structure.version));
  });
  it('Parse hash name', () => {
    const { hashName } = assignNameClaim.structure;
    expect(utils.bytesToHex(hashName)).to.be.equal(utils.bytesToHex(parsedClaim.structure.hashName));
  });
  it('Parse id address', () => {
    const { id } = assignNameClaim.structure;
    expect(utils.bytesToHex(id)).to.be.equal(utils.bytesToHex(parsedClaim.structure.id));
  });
  it('Extract bytes from full element', () => {
    const bytesFromElement = elementsFromClaim.bytes();
    expect(bytesFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                         + '000000000000000000000000393939393939393939393939393939393939393a'
                                         + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                                         + '000000000000000000000000000000000000000000000001f60d928459d792ed');
  });
  it('Calculate Hi', () => {
    const hi = elementsFromClaim.hi();
    const hiResult = '0x23966b07b31bad5aebd8af6c72c7650f8ab45886e442f427da6c1bce73dbd2bb';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = elementsFromClaim.hv();
    const hvResult = '0x279689e54ed1540614ba9ca682a01e83eb8b6aa3abf85b1f659fd537a75c5d6a';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
