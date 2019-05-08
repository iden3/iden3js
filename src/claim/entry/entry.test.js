// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const utils = require('../../utils');

const { expect } = chai;

describe('[Entry]', () => {
  let entry;
  before('Create new entry', () => {
    entry = Entry.newEmpty();
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
    expect(utils.bytesToHex(hi)).to.be.equal('0x0ba9f73d6c67b5a4d8749cfc2bec68bc733871df215651abae87ca61e05a86bb');
  });
  it('Get Hash value', () => {
    const hv = entry.hv();
    expect(utils.bytesToHex(hv)).to.be.equal('0x2cbec4d1f8d893075e5d542314667e006040acee4e9c917fb01941f58d8f9044');
  });
  it('Get hexadecimal from entry', () => {
    const entryHex = entry.toHex();
    expect(entryHex).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                 + '0101010101010101010101010101010101010101010101010101010101010101'
                                 + '0202020202020202020202020202020202020202020202020202020202020202'
                                 + '0303030303030303030303030303030303030303030303030303030303030303');
  });
  it('Get entry from hexadecimal', () => {
    const entryHex = '0x0000000000000000000000000000000000000000000000000000000000000000'
                     + '0101010101010101010101010101010101010101010101010101010101010101'
                     + '0202020202020202020202020202020202020202020202020202020202020202'
                     + '0303030303030303030303030303030303030303030303030303030303030303';
    entry = Entry.newFromHex(entryHex);
    expect(utils.bytesToHex(entry.elements[0])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 0)));
    expect(utils.bytesToHex(entry.elements[1])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 1)));
    expect(utils.bytesToHex(entry.elements[2])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 2)));
    expect(utils.bytesToHex(entry.elements[3])).to.be.equal(utils.bytesToHex(Buffer.alloc(32, 3)));
  });
  it('.fromHex equivalent to .toHex', () => {
    const originalLeafHex = '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff50000000000000000000000000000000000007833000000000000000000000004';
    const leaf = Entry.newFromHex(originalLeafHex);
    leaf.hi();
    leaf.hv();
    expect(leaf.toHex()).to.be.equal(originalLeafHex);
  });
});
