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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2fecf7f54e3784545e083af5aaed31ebe8529d0a05b3c83f7ecfd96b99dd3220');
  });
});

describe('[sparse-merkle-tree] getClaimByHi', () => {
  it('getClaimByHi', () => {
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

    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2fecf7f54e3784545e083af5aaed31ebe8529d0a05b3c83f7ecfd96b99dd3220');
    const totalClaim = mt.getClaimByHi(secondClaim.index);
    expect(totalClaim[0].value).to.be.equal(secondClaim.value[0].value);
    expect(totalClaim[1].value).to.be.equal(secondClaim.value[1].value);
    expect(totalClaim[2].value).to.be.equal(secondClaim.value[2].value);
    expect(totalClaim[3].value).to.be.equal(secondClaim.value[3].value);
  });
});

describe('[sparse-merkle-tree] add claims in different orders', () => {
  it('add one claim', () => {
    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 16; i++) {
      const claim = {
        value: [bigInt(0), bigInt(i), bigInt(0), bigInt(i)],
        index: [bigInt(0), bigInt(i)],
      };
      mt1.addClaim(claim);
    }

    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 15; i >= 0; i--) {
      const claim = {
        value: [bigInt(0), bigInt(i), bigInt(0), bigInt(i)],
        index: [bigInt(0), bigInt(i)],
      };
      mt2.addClaim(claim);
    }
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x279d167d64b63c38285766a7003fad9253d1c57281c0f69fbdb072b7d3633639');
  });
});

describe('[sparse-merkle-tree] generateProof', () => {
  it('with only one claim in the MerkleTree, and with two claims in the MerkleTree', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = {
      value: [bigInt(12), bigInt(45), bigInt(78), bigInt(41)],
      index: [bigInt(12), bigInt(45)],
    };
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1e027004fed670669c5ac756f7cf39cd607299252c241a14d49f478dbd52c3a5');
    const proof = mt.generateProof(firstClaim.index);
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

    const secondClaim = {
      value: [bigInt(33), bigInt(44), bigInt(55), bigInt(66)],
      index: [bigInt(33), bigInt(44)],
    };
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0xc85f08a5500320b7877bffec8298f5c222c260e6ba86968114d70f8591ccef3e');
    const hi2 = iden3.utils.hashBytes(secondClaim.index);
    const proof2 = mt.generateProof(hi2);
    expect(iden3.utils.bytesToHex(proof2)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000001feedc5746452611b2d5fc83bbc72ebeb1e284c071e1552a1876ae7e1d5043946');
  });
});
