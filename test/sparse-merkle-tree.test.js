const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('../src/sparse-merkle-tree/sparse-merkle-tree-utils');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2d49fc39bb8f19f26ad47f63b45f77eb4ca50e6548244140a63a105d7c4535d2');
  });
});

describe('[sparse-merkle-tree] add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2d49fc39bb8f19f26ad47f63b45f77eb4ca50e6548244140a63a105d7c4535d2');

    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x24dcdcb8b10bed49ed2c7795972f2bea478750fc9940eeb64f42440fe0db7cbe');
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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2d49fc39bb8f19f26ad47f63b45f77eb4ca50e6548244140a63a105d7c4535d2');

    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x24dcdcb8b10bed49ed2c7795972f2bea478750fc9940eeb64f42440fe0db7cbe');
    const totalClaim = mt.getClaimByHi(secondClaim.slice(2));
    // Compare claim fields
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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2d49fc39bb8f19f26ad47f63b45f77eb4ca50e6548244140a63a105d7c4535d2');
    const proof = mt.generateProof(firstClaim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
  it('with 4 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 4; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(2)];
    const totalClaim = mt.getClaimByHi(proofClaim.slice(2));
    expect(totalClaim[0].value).to.be.equal(proofClaim[0].value);
    expect(totalClaim[1].value).to.be.equal(proofClaim[1].value);
    expect(totalClaim[2].value).to.be.equal(proofClaim[2].value);
    expect(totalClaim[3].value).to.be.equal(proofClaim[3].value);

    const proof = mt.generateProof(proofClaim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000b293a5e97fccfafe457fa22796168cfce0ff8928fbbd7da9d2cf983287ec52f3317f0c4fe7ebb238a42891bce3d7d2cdf288f1a0237f97530611a591c6deae08e17f267633bb0021e42eac5a0662921709310747225d4fcae6b6c63187b0e7a62');
  });
  it('with 64 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 64; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(4)];
    const totalClaim = mt.getClaimByHi(proofClaim.slice(2));
    expect(totalClaim[0].value).to.be.equal(proofClaim[0].value);
    expect(totalClaim[1].value).to.be.equal(proofClaim[1].value);
    expect(totalClaim[2].value).to.be.equal(proofClaim[2].value);
    expect(totalClaim[3].value).to.be.equal(proofClaim[3].value);

    const proof = mt.generateProof(proofClaim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f29b583ac7aa28489977b8383d310b47282010a30d3ef76d31a462845cec334a304574e4a467d11f2c53c3653548ea4c6b4884194c1efb32d96d0f6ef5d70c420301af026598b737db5fad61d12769c1c350e9b395dffc1c42b46ebf888c31bd61b6514b48b7da109066e8a0952ae47f4d7b031a2f690bdcde9e2e84746bc036c');
  });
});

describe('[sparse-merkle-tree] VerifyProof', () => {
  it('proof-of-existence', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(4)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHt(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const htHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f2b724aa8a314c8da446586a0636329c4815794b913e4dfa4a15bdf58ef34b507209978f585bd0ac41e12c9089441a52a68baf5b08959f9c68a89d72eb630c48b2d36441b75d605e210812607b31c35be8210e011fb7faf830cf74cd13cb3686f17f0c4fe7ebb238a42891bce3d7d2cdf288f1a0237f97530611a591c6deae08e');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, htHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence non empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(10)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHt(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const htHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x03020000000000000000000000000000000000000000000000000000000000032457c8e7eabebeeef71726e920f7c8b63da2f6b3cd97743ea8fb49eae76e46641ba6d011509e611076162c1f94e6e099a0e9fc0f992282f881324213dd4e3e40198571b3d34d0989950c7dfd52209ceb5d85400d08137d90cbd96d6223f3a18b2d957252161c7a359052be895ef1bf56228e3a2977ad906d1d4b25dfb8aadb1c');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, htHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(12)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHt(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const htHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x010400000000000000000000000000000000000000000000000000000000000b2457c8e7eabebeeef71726e920f7c8b63da2f6b3cd97743ea8fb49eae76e4664293a5e97fccfafe457fa22796168cfce0ff8928fbbd7da9d2cf983287ec52f332fe2cda15e178196dc20854bbe646533657523f56a92930aaed3eb2dc88369ff');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, htHex);
    expect(check).to.be.equal(true);
  });
});

describe('[merkle-tree] Verify Proof', () => {
  it('invalid claim argument', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(4)];
    // Generate proof of an existing node
    const proof = mt.generateProof(proofClaim.slice(2));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    // Verify proof with node mismatch between generated proof and  node used for verification
    const proofClaimFalse = [bigInt(0), bigInt(5), bigInt(0), bigInt(5)];
    const hashes = iden3.sparseMerkleTree.getHiHt(proofClaimFalse);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const htHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, htHex);
    expect(check).to.be.equal(false);
  });
  it('invalid non-existence proof', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(4), bigInt(0), bigInt(4)];
    const proof = mt.generateProof(proofClaim.slice(2));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    const objectProof = helpers.parseProof(proofHex);
    // Manipulate proof from existence to non-existence
    // and adding node metadata as auxiliary node
    objectProof.flagExistence = true;
    const hashes = iden3.sparseMerkleTree.getHiHt(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const htHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const hashesBuff = Buffer.concat(helpers.getArrayBuffFromArrayBigInt(hashes));
    objectProof.metaData = hashesBuff;
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, htHex);
    expect(check).to.be.equal(false);
  });
});
