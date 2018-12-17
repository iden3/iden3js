const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('../src/sparse-merkle-tree/sparse-merkle-tree-utils');

const { bigInt } = snarkjs;
const { expect } = chai;

// new database
const db = new iden3.Db();
// hardcoded id address for testing purposes
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';


describe('[merkle-tree] pre test', () => {
  it('Random test', () => {
    const random = helpers.getIndexArray(bigInt(11));
  });
});


describe('[merkle-tree] empty tree', () => {
  it('should be empty', () => {
    const mt = new iden3.merkleTree.MerkleTree(db, idAddr);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('[sparse-merkle-tree] addClaim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const claim = {
      value: [bigInt(12), bigInt(45), bigInt(78), bigInt(41)],
      index: [bigInt(12), bigInt(45)],
    };
    mt.addClaim(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1e027004fed670669c5ac756f7cf39cd607299252c241a14d49f478dbd52c3a5');
  });
});

describe('[sparse-merkle-tree] add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = {
      value: [bigInt(12), bigInt(45), bigInt(78), bigInt(41)],
      index: [bigInt(12), bigInt(45)],
    };
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1e027004fed670669c5ac756f7cf39cd607299252c241a14d49f478dbd52c3a5');

    const secondClaim = {
      value: [bigInt(33), bigInt(44), bigInt(55), bigInt(66)],
      index: [bigInt(33), bigInt(44)],
    };
    mt.addClaim(secondClaim);
    let root = iden3.utils.bytesToHex(mt.root);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2fecf7f54e3784545e083af5aaed31ebe8529d0a05b3c83f7ecfd96b99dd3220');
  });
});
