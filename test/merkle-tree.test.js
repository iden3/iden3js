const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;

describe('checkProof()', () => {
  it('checkProof 1', () => {
    const rootHex = '0x7d7c5e8f4b3bf434f3d9d223359c4415e2764dd38de2e025fbf986e976a7ed3d';
    const mpHex = '0x0000000000000000000000000000000000000000000000000000000000000002d45aada6eec346222eaa6b5d3a9260e08c9b62fcf63c72bc05df284de07e6a52';
    const hiHex = '0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878';
    const htHex = '0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878';
    const verified = iden3.merkleTree.checkProof(rootHex, mpHex, hiHex, htHex, 140);

    expect(verified).to.be.equal(true);
  });
});
describe('checkProof of Empty Leaf', () => {
  it('checkProof', () => {
    const rootHex = '0x8f021d00c39dcd768974ddfe0d21f5d13f7215bea28db1f1cb29842b111332e7';
    const mpHex = '0x0000000000000000000000000000000000000000000000000000000000000004bf8e980d2ed328ae97f65c30c25520aeb53ff837579e392ea1464934c7c1feb9';
    const hiHex = '0xa69792a4cff51f40b7a1f7ae596c6ded4aba241646a47538898f17f2a8dff647';
    const htHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const verified = iden3.merkleTree.checkProof(rootHex, mpHex, hiHex, htHex, 140);

    expect(verified).to.be.equal(true);
  });
});
