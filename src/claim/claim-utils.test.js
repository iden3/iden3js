const chai = require('chai');
const Entry = require('./entry/entry');
const utils = require('../utils');
const claimUtils = require('./claim-utils');

const { expect } = chai;

describe('[Claim-utils]', () => {
  let entry;
  before('Create new entry', () => {
    entry = new Entry();
  });

  it('Parse entry into claim authorize key sign secp256k1', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                     + '0000000000000000000000000000000000004d59000000010000000000000004';
    entry.fromHexadecimal(entryHex);
    const claim = claimUtils.newClaimFromEntry(entry);
    expect(utils.bytesToHex(claim.structure.pubKeyCompressed)).to.be.equal('0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
    expect((claim.structure.version).readUInt32BE(0)).to.be.equal(1);
  });

  it('Parse entry into claim authorize key sign', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0000000000000000000000000000000000000000000000000000000000000000'
                     + '0505050505050505050505050505050505050505050505050505050505050506'
                     + '0000000000000000000000000000000000000001000000010000000000000001';
    entry.fromHexadecimal(entryHex);
    const claim = claimUtils.newClaimFromEntry(entry);
    expect((claim.structure.version).readUInt32BE(0)).to.be.equal(1);
    expect((claim.structure.sign).readUInt8(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.structure.ay)).to.be.equal('0x0505050505050505050505050505050505050505050505050505050505050506');
  });

  it('Parse entry into claim assign name', () => {
    const nameExample = 'example.iden3.eth';
    const hashNameExample = utils.hashBytes(nameExample).slice(1, 32);
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '000000000000000000000000393939393939393939393939393939393939393a'
                     + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                     + '0000000000000000000000000000000000000000000000010000000000000003';
    entry.fromHexadecimal(entryHex);
    const claim = claimUtils.newClaimFromEntry(entry);
    expect((claim.structure.version).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.structure.id)).to.be.equal('0x393939393939393939393939393939393939393a');
    expect(utils.bytesToHex(claim.structure.hashName)).to.be.equal(utils.bytesToHex(hashNameExample));
  });

  it('Parse entry into claim set root key', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                     + '000000000000000000000000393939393939393939393939393939393939393a'
                     + '0000000000000000000000000000000000000001000000010000000000000002';
    entry.fromHexadecimal(entryHex);
    const claim = claimUtils.newClaimFromEntry(entry);
    expect((claim.structure.version).readUInt32BE(0)).to.be.equal(1);
    expect((claim.structure.era).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.structure.id)).to.be.equal('0x393939393939393939393939393939393939393a');
    expect(utils.bytesToHex(claim.structure.rootKey)).to.be.equal('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
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
    entry.fromHexadecimal(entryHex);
    const claim = claimUtils.newClaimFromEntry(entry);
    expect((claim.structure.version).readUInt32BE(0)).to.be.equal(1);
    expect(utils.bytesToHex(claim.structure.index)).to.be.equal(utils.bytesToHex(indexExample));
    expect(utils.bytesToHex(claim.structure.extraData)).to.be.equal(utils.bytesToHex(dataExample));
  });
});
