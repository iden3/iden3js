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
    expect(utils.bytesToHex(hi)).to.be.equal('0x0ece0d95ccb00544fc92645f446d52a2f7526c046d0c9d9fffeb2fc8dc38b58a');
  });
  it('Get Hash value', () => {
    const hv = entry.hv();
    expect(utils.bytesToHex(hv)).to.be.equal('0x197951765bf12947bbd7ef4662dbb210e455882529d7f032e728c73b56392609');
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
