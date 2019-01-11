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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x27c454ae17339dae86b77f0b07a7ff72673201892e281d60394a9b646de29ce3');
  });
});

describe('[sparse-merkle-tree] add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1475e8f7d486a8d045a04533ad8b27d16ab4850df4e64dc9e39cecb2fcb47cbf');
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
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x1059bfb4f2018d8e15dc5186322b7316d4abda1d534966d0c54e07a4007df51f');
  });
});


describe('[sparse-merkle-tree] getClaimByHi', () => {
  it('getClaimByHi', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000b'
                                                      + '1741ceec35cfc2795e17e4c9ce80992370610dfb25dd01286b33ee5d1a972499'
                                                      + '16ff8f7e5e5ddd7d366eb5758dd44a28823186e85d2d9480d85f45e5e57eba54'
                                                      + '0c719d2afaa5a6769e541b968029fc6ab2ae9c3a4198948f94aebd87a76a3aed');
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f'
                                                      + '28df49923aa56a1f3320633c097d56c6f062b5d490698bcca2a84df0c5a7fe87'
                                                      + '0f317f06dfbe10aff5f0a703a7aa09b86011bfc2ad4b465268b52e7dfb0d1ebb'
                                                      + '1e27a375be49f9162136014a9d618b67c6379cf77d77fdc5d6778500e0c93f40'
                                                      + '106e06a9159094113e5d8a94517eb5f468046cd3149b8085391d088b5ab159a4');
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

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f'
                                 + '1e14ba1e64291bdb0663fd7c4cab8c03115342cdcc6318bcfce8680e5fba816b'
                                 + '2e3a99b1833362c92ae3c82b8c4b90e7f79cf7335337cb55e3653aa277d72eae'
                                 + '060a556d978c2b44a12eb35040fc8ce6aa5a4479a34d37f98cb417a59e12f82b'
                                 + '16ff8f7e5e5ddd7d366eb5758dd44a28823186e85d2d9480d85f45e5e57eba54');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
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

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0302000000000000000000000000000000000000000000000000000000000003'
                                 + '1a97e2325fa70b3ba4958922473b8a55bb24a55d799b583da6f78f89d8d48dea'
                                 + '3012b3dcbfea0c8d3ecde559c5670ee09a8dfd5b67bbd99dca42d82e4bd06535'
                                 + '198571b3d34d0989950c7dfd52209ceb5d85400d08137d90cbd96d6223f3a18b'
                                 + '15331daa10ae035babcaabb76a80198bc449d32240ebb7f456ff2b03cd69bca4');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
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

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x010400000000000000000000000000000000000000000000000000000000000b'
                                 + '1a97e2325fa70b3ba4958922473b8a55bb24a55d799b583da6f78f89d8d48dea'
                                 + '1741ceec35cfc2795e17e4c9ce80992370610dfb25dd01286b33ee5d1a972499'
                                 + '25e3a822b71c29996133b4a77b0336e1cb6a07950f6b7765822512640d31e638');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
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
    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaimFalse);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
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
    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
    const hashesBuff = Buffer.concat(helpers.getArrayBuffFromArrayBigInt(hashes));
    objectProof.metaData = hashesBuff;
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(false);
  });
});
