// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const assignName = require('./assign-name');
const utils = require('../../utils');

const { expect } = chai;

describe('[Claim Assign Name]', () => {
  const versionExample = 1;
  const nameExample = 'example.iden3.eth';
  const idExample = '0x393939393939393939393939393939393939393A';
  let claimAssignName;
  let entryClaim;
  let parsedClaim;

  before('Create new assign name claim', () => {
    claimAssignName = assignName.AssignName.new(versionExample, nameExample, idExample);
    expect(claimAssignName).to.not.be.equal(null);
    entryClaim = claimAssignName.toEntry();
    parsedClaim = assignName.AssignName.newFromEntry(entryClaim);
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimAssignName.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimAssignName.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse hash name', () => {
    expect(utils.bytesToHex(claimAssignName.hashName.slice(1, 32))).to.be.equal(utils.bytesToHex(parsedClaim.hashName));
  });
  it('Parse id address', () => {
    expect(utils.bytesToHex(claimAssignName.id)).to.be.equal(utils.bytesToHex(parsedClaim.id));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '000000000000000000000000393939393939393939393939393939393939393a'
                                       + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                                       + '0000000000000000000000000000000000000000000000010000000000000003');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x106d1a898d4503f4cb20be6ce9aeb2ac1e65d522579805e3633408a4b9ffcb53';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x09a4b0eb3812af4321e445f464ee27838b5742604ca13b89822efffe02f3d5fc';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
