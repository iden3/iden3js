const chai = require('chai');
const Entry = require('./entry');
const utils = require('../../utils');

const { expect } = chai;

describe('[Entry]', () => {
  let entry;
  before('Create new entry', () => {
    entry = new Entry();
  });

  it('Entry initial values', () => {
    expect(utils.bytesToHex(entry.elements[0])).to.be.equal(utils.bytesToHex(Buffer.alloc(32)));
    expect(utils.bytesToHex(entry.elements[1])).to.be.equal(utils.bytesToHex(Buffer.alloc(32)));
    expect(utils.bytesToHex(entry.elements[2])).to.be.equal(utils.bytesToHex(Buffer.alloc(32)));
    expect(utils.bytesToHex(entry.elements[3])).to.be.equal(utils.bytesToHex(Buffer.alloc(32)));
  });
  it('Set values to entry elements', () => {
    entry.elements[0] = Buffer.alloc(32, 0);
    entry.elements[1] = Buffer.alloc(32, 1);
    entry.elements[2] = Buffer.alloc(32, 2);
    entry.elements[3] = Buffer.alloc(32, 3);
    expect(utils.bytesToHex(entry.elements[0])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 0)));
    expect(utils.bytesToHex(entry.elements[1])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 1)));
    expect(utils.bytesToHex(entry.elements[2])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 2)));
    expect(utils.bytesToHex(entry.elements[3])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 3)));
  });
  it('Get Hash index', () => {
    const hi = entry.hi();
    expect(utils.bytesToHex(hi)).to.be.equal('0x2304a2d0b3a4026eacc830273603d35f99c8bd689feeeb7f7042bc8ef6014f4e');
  });
  it('Get Hash value', () => {
    const hv = entry.hv();
    expect(utils.bytesToHex(hv)).to.be.equal('0x2c6397b84fd6ff87efb46d883aa31b61622c72550ebfdca90c4856f60030a95f');
  });
  it('Get hexadecimal from entry', () => {
    const entryHex = entry.toHexadecimal();
    expect(entryHex).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                 + '0101010101010101010101010101010101010101010101010101010101010101'
                                 + '0202020202020202020202020202020202020202020202020202020202020202'
                                 + '0303030303030303030303030303030303030303030303030303030303030303');
  });
});
