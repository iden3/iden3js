// @flow
import { describe, it } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const snarkjs = require('snarkjs');
const { babyJub } = require('circomlib');
const claimUtils = require('./claim-utils');
const claim = require('./claim');
const utils = require('../utils');

const { bigInt } = snarkjs;
const { expect } = chai;

describe('[claim-utils]', () => {
  it('Increment claim version', () => {
    // hardcode entry
    const versionHardcoded = 1;
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                     + '0000000000000000000000000000000000004d59000000010000000000000004';
    const entry = Entry.newFromHex(entryHex);
    // increase version
    claimUtils.incClaimVersion(entry);
    const claimExample = claim.newClaimFromEntry(entry);
    expect(claimExample).to.be.not.equal(undefined);
    if (claimExample == null) { return; }
    const versionInc = claimExample.version;
    expect(versionInc).to.be.equal(versionHardcoded + 1);
  });

  it('Clear most significant byte', () => {
    const testIn = '0xf6f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    const testOutBuff = claimUtils.clearElemMostSignificantByte(utils.hexToBytes(testIn));
    const testInSim = '0x00f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    expect(testInSim).to.be.equal(utils.bytesToHex(testOutBuff));

    const testIn2 = '0x00f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    const testOutBuff2 = claimUtils.clearElemMostSignificantByte(utils.hexToBytes(testIn2));
    expect(testIn2).to.be.equal(utils.bytesToHex(testOutBuff2));
  });

  it('Check valid entry claim', () => {
    // Check hash is more than 32 bytes
    const hash0 = '0xf6a4f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    expect(() => {
      claimUtils.checkElemFitsClaim(utils.hexToBytes(hash0));
    }).to.throw('Element is not 32 bytes length');
    // Check hash is not valid for claim field
    const hash1 = '0xf6f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    expect(() => {
      claimUtils.checkElemFitsClaim(utils.hexToBytes(hash1));
    }).to.throw('Element does not fit on claim element size');
    // Check hash is valid
    const hash2 = '0x06f36d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd';
    expect(() => {
      claimUtils.checkElemFitsClaim(utils.hexToBytes(hash2));
    }).not.to.throw();
  });

  it('Check valid entry element', () => {
    // Check elem fits on claim element size
    const test = babyJub.p;
    const test1 = test.add(bigInt(1));
    expect(() => {
      claimUtils.checkElemFitsClaim(utils.bigIntToBufferBE(test));
    }).not.to.throw();
    expect(() => {
      claimUtils.checkElemFitsClaim(utils.bigIntToBufferBE(test1));
    }).to.throw('Element does not fit on claim element size');
  });
});
