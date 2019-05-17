// @flow
import { describe, it } from 'mocha';
import { Entry } from './entry/entry';

const chai = require('chai');
const utils = require('../utils');
const claimUtils = require('./claim');

const { expect } = chai;

describe('[Claim-utils]', () => {
  it('Parse entry into claim authorize key sign secp256k1', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                     + '0000000000000000000000000000000000004d59000000010000000000000004';
    const entry = Entry.newFromHex(entryHex);
    const claim = (claimUtils.newClaimFromEntry(entry): any);
    expect(utils.bytesToHex(claim.pubKeyCompressed)).to.be.equal('0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
    expect((claim.version).readUInt32BE(0)).to.be.equal(1);
  });

  it('Parse entry into claim authorize key sign babyjub', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '031ebff0c058993f2dce2f14b891093a2115f48e711bb39ecb8e4b90e94f8425'
                     + '0000000000000000000000000000000000000000000000010000000000000001';
    const entry = Entry.newFromHex(entryHex);
    const claim = (claimUtils.newClaimFromEntry(entry): any);
    expect((claim.version).readUInt32BE(0)).to.be.equal(1);
    expect((claim.sign).readUInt8(0)).to.be.equal(0);
    expect(utils.bytesToHex(claim.ay)).to.be.equal('0x031ebff0c058993f2dce2f14b891093a2115f48e711bb39ecb8e4b90e94f8425');
  });

  it('Parse entry into claim assign name', () => {
    const nameExample = 'example.iden3.eth';
    const hashNameExample = utils.hashBytes(Buffer.from(nameExample, 'utf8')).slice(1, 32);
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '000000000000000000000000393939393939393939393939393939393939393a'
                     + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                     + '0000000000000000000000000000000000000000000000010000000000000003';
    const entry = Entry.newFromHex(entryHex);
    const claim = (claimUtils.newClaimFromEntry(entry): any);
    expect((claim.version).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.id)).to.be.equal('0x393939393939393939393939393939393939393a');
    expect(utils.bytesToHex(claim.hashName)).to.be.equal(utils.bytesToHex(hashNameExample));
  });

  it('Parse entry into claim set root key', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                     + '000000000000000000000000393939393939393939393939393939393939393a'
                     + '0000000000000000000000000000000000000001000000010000000000000002';
    const entry = Entry.newFromHex(entryHex);
    const claim = (claimUtils.newClaimFromEntry(entry): any);
    expect((claim.version).readUInt32BE(0)).to.be.equal(1);
    expect((claim.era).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.id)).to.be.equal('0x0000000000000000000000393939393939393939393939393939393939393a');
    expect(utils.bytesToHex(claim.rootKey)).to.be.equal('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  });

  it('Parse entry into basic claim', () => {
    const indexExample = Buffer.alloc(50);
    indexExample.fill(41, 0, 1);
    indexExample.fill(42, 1, 49);
    indexExample.fill(43, 49, 50);
    const dataExample = Buffer.alloc(62);
    dataExample.fill(86, 0, 1);
    dataExample.fill(88, 1, 61);
    dataExample.fill(89, 61, 62);
    const entryHex = '0x0056585858585858585858585858585858585858585858585858585858585858'
                     + '0058585858585858585858585858585858585858585858585858585858585859'
                     + '00292a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
                     + '002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2b000000010000000000000000';
    const entry = Entry.newFromHex(entryHex);
    const claim = (claimUtils.newClaimFromEntry(entry): any);
    expect((claim.version).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.index)).to.be.equal(utils.bytesToHex(indexExample));
    expect(utils.bytesToHex(claim.extraData)).to.be.equal(utils.bytesToHex(dataExample));
  });
});
