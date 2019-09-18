// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const claim = require('./claim');
const utils = require('../utils');

const { expect } = chai;

describe('[Claim Assign Name]', () => {
  const versionExample = 1;
  const nameExample = 'example.iden3.eth';
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  let claimAssignName;
  let entryClaim;
  let parsedClaim;

  before('Create new assign name claim', () => {
    claimAssignName = new claim.AssignName(nameExample, idExample);
    claimAssignName.version = versionExample;
    expect(claimAssignName).to.not.be.equal(null);
    entryClaim = claimAssignName.toEntry();
    parsedClaim = claim.AssignName.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAssignName.version).to.be.equal(parsedClaim.version);
  });
  it('Parse hash name', () => {
    expect(claimAssignName.hashName.toString('hex')).to.be.equal(parsedClaim.hashName.toString('hex'));
  });
  it('Parse id address', () => {
    expect(claimAssignName.id).to.be.equal(parsedClaim.id);
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                                       + '0000000000000000000000000000000000000000000000010000000000000003');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x16b32b9bc822ab5c1136eb099c7b05864914d7ee2cc531f932e6264c2d4b65e2';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0aad8bdcc40190af0a66c21b5fc0da7a3ad11ce0f718d5bc9d9457ca39cfec22';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });

  it('Parse entry into claim assign name', () => {
    const hashNameExample = utils.hashBytes(Buffer.from(nameExample, 'utf8')).slice(1, 32);
    const entryHex = entryClaim.toHex();

    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.id).to.be.equal(idExample);
    expect(c0.hashName.toString('hex')).to.be.equal(hashNameExample.toString('hex'));
  });
});
