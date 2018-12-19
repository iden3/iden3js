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

describe('[sparse-merkle-tree] add Claim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1df7cebd140deb47d0a7f841f7f5b0f48c9d115a3d5b50fb176c295c7293f1a0');
  });
});

describe('[sparse-merkle-tree] add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1df7cebd140deb47d0a7f841f7f5b0f48c9d115a3d5b50fb176c295c7293f1a0');

    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2b8225c5b022f156a4f497cfe4b95527dcf08f30693610c60f1770221fb57687');
  });
});

describe('[sparse-merkle-tree] add claims in different orders', () => {
  it('add claims in differnet orders', () => {
    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 16; i++) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(i)];
      mt1.addClaim(claim);
    }

    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 15; i >= 0; i--) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(i)];
      mt2.addClaim(claim);
    }
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x0bd26ed069568d6db1032f2761b56167d8b618204c5c1b0dd54bb4a4010fe36e');
  });
});


describe('[sparse-merkle-tree] getClaimByHi', () => {
  it('getClaimByHi', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1df7cebd140deb47d0a7f841f7f5b0f48c9d115a3d5b50fb176c295c7293f1a0');

    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);

    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2b8225c5b022f156a4f497cfe4b95527dcf08f30693610c60f1770221fb57687');
    const totalClaim = mt.getClaimByHi(secondClaim.slice(0, 2));
    expect(totalClaim[0].value).to.be.equal(secondClaim[0].value);
    expect(totalClaim[1].value).to.be.equal(secondClaim[1].value);
    expect(totalClaim[2].value).to.be.equal(secondClaim[2].value);
    expect(totalClaim[3].value).to.be.equal(secondClaim[3].value);
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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2fecf7f54e3784545e083af5aaed31ebe8529d0a05b3c83f7ecfd96b99dd3220');
    const proof2 = mt.generateProof(secondClaim.index);
    expect(iden3.utils.bytesToHex(proof2)).to.be.equal('0x01000000000000000000000000000000000000000000000000000000000000011e027004fed670669c5ac756f7cf39cd607299252c241a14d49f478dbd52c3a5');
  });
  
/*
  it('with several claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 4; i++) {
      const claim = {
        value: [bigInt(0), bigInt(i), bigInt(0), bigInt(0)],
        index: [bigInt(0), bigInt(i)],
      };
      mt.addClaim(claim);
    }
    const proofClaim = {
      value: [bigInt(0), bigInt(2), bigInt(0), bigInt(0)],
      index: [bigInt(0), bigInt(2)],
    };
    const proof = mt.generateProof(proofClaim.index);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x040000000000000000000000000000000000000000000000000000000000000b0de8c389fac6c65e560d7def3e08e68d908af0a2363a9d32a2f6a1b98a5e2c8601bcec76425a7b51ecbbfa7cbf37f4ec55df516ae9f8b28ff012a2e5e61f44b5153e712d702c3db90798c9ec2f7bdbaefe5c3636acdd139cb0ddb31e1825d284');
  });
});
*/
