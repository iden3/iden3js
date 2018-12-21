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
/*
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
  it('with 1 caim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1df7cebd140deb47d0a7f841f7f5b0f48c9d115a3d5b50fb176c295c7293f1a0');
    const proof = mt.generateProof(firstClaim.slice(0, 2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
  it('with 4 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 4; i++) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(0)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(2), bigInt(0), bigInt(0)];
    const totalClaim = mt.getClaimByHi(proofClaim.slice(0, 2));
    expect(totalClaim[0].value).to.be.equal(proofClaim[0].value);
    expect(totalClaim[1].value).to.be.equal(proofClaim[1].value);
    expect(totalClaim[2].value).to.be.equal(proofClaim[2].value);
    expect(totalClaim[3].value).to.be.equal(proofClaim[3].value);


    const proof = mt.generateProof(proofClaim.slice(0, 2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000b06ecbe5130b29a9dbfa0a89a3605bb67773b3020d8796d546779ead5687432f317f0c4fe7ebb238a42891bce3d7d2cdf288f1a0237f97530611a591c6deae08e056b321df2539843255fba79e586214174b94a882ec0a2cc8ff9a0640611496a');
  });
  it('with 64 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 64; i++) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(0)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(4), bigInt(0), bigInt(0)];
    const totalClaim = mt.getClaimByHi(proofClaim.slice(0, 2));
    expect(totalClaim[0].value).to.be.equal(proofClaim[0].value);
    expect(totalClaim[1].value).to.be.equal(proofClaim[1].value);
    expect(totalClaim[2].value).to.be.equal(proofClaim[2].value);
    expect(totalClaim[3].value).to.be.equal(proofClaim[3].value);


    const proof = mt.generateProof(proofClaim.slice(0, 2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f292506e16d361eefe251663c5c172716c7ac21dcb6cee25045b2f04f14d02bce1f7ee0d60e20dd6b7d65052a0257b0324f8a74caf84e7471172ba4ca5447653f2be99c641f7d3dbad0ae9efb269374d9222624293bb32b2f70bcfc14d2b65a9024ced9ee38f11308d7f2d2e41a0758fdc51caf1c63abac55a2c7713e12b5bcfe');
  });
});
*/
describe('[sparse-merkle-tree] VerifyProof', () => {
  it('with 64 caim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 4; i++) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(0)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(2), bigInt(0), bigInt(0)];
    const proof = mt.generateProof(proofClaim.slice(0, 2));

    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);

    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, proofClaim);
    expect(check).to.be.equal(true);
  });
});
