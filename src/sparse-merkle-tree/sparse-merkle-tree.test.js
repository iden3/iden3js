const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('./sparse-merkle-tree-utils');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

describe('[sparse-merkle-tree] Empty tree', () => {
  it('should be empty', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('[sparse-merkle-tree] Add Claim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2e4bd3b61579f9ed4d814dfa4228c743b853fb6d0b5d6a80735bd5aab579231f');
  });
});

describe('[sparse-merkle-tree] Add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2c0efd3fd64110611ee03714790060b506fc52229146df05474f89b50b8018fa');
  });
});

describe('[sparse-merkle-tree] Add claims in different orders', () => {
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
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x171726a6de9a2e6112f467543ce72f67871e7804c070355ff98f6ba63631c25f');
  });
});


describe('[sparse-merkle-tree] Get claim by its index', () => {
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

describe('[sparse-merkle-tree] Generate proof', () => {
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000d'
                                                      + '2f5e46500bd35bd62bcd14a6587f33003270e26a74a5a0f606e6380d209c338c'
                                                      + '0a108d874a3f027a9f3e8e2b6f3dad0faa5304fd3c5c7a70c6289b7fbe44dd43'
                                                      + '04e61a72b69b24e24458f33ed6c07fcb8126782b47fba27b9123182a9b4e3ff2');
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000700000000000000000000000000000000000000000000000000000000005f'
                                                      + '292f31c3effbd4ef90051e62e453ce5ba9253a790c33e99ee7989d3778b841c9'
                                                      + '176f8d38c4bda0ced90edd02a1131d9f328ed83659dff2a6a5b7072a53484944'
                                                      + '01eae6da67bc0a8033b7f7ea961a9b88a14477f8f7a90fa0ac7fcb10a7f06626'
                                                      + '0fe17cbefb6ad59ca52b64788a80f77636bb0a03b5ee8ce41bdd327323ded8f5'
                                                      + '2f26ab8d6d6a3eae1d7e9b3522b55ede77619cbc4e157c23f63522a6298b88b0'
                                                      + '260716f66b66072ba0c6b418995af4ba604953f91d376c76d5ca2a655f4a073b');
  });
});

describe('[sparse-merkle-tree] Verify roof', () => {
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
    expect(proofHex).to.be.equal('0x0002000000000000000000000000000000000000000000000000000000000003'
                                 + '06704e71b5ba8daa15428ae04764b14c403211e7a4dd57dca9e1ff3cd7b7f0e7'
                                 + '128c1ba622cda99a3144e7178a6bdc59ad8d180b642aee16622613ab65c97419');
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
                                 + '06704e71b5ba8daa15428ae04764b14c403211e7a4dd57dca9e1ff3cd7b7f0e7'
                                 + '128c1ba622cda99a3144e7178a6bdc59ad8d180b642aee16622613ab65c97419'
                                 + '01b64831f1504ebb67612647c67a30640023df5b51236ab409cd85923b0206d5'
                                 + '13580fd5d3ca0f7604a3a50f663cb4fd23c214f1955fa5b3ee9ed5ed06bb70a3');
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
    expect(proofHex).to.be.equal('0x0302000000000000000000000000000000000000000000000000000000000003'
                                 + '0397d8b2557e1fd4d6ca48508c0a976bfea8a5b81e99e0f08c1dfddd93ddd16b'
                                 + '2b0905533da6edc91cd889feca537ffb36ec12546bebd31554d090d9a751a966'
                                 + '21299cf503028e491b03603fbff7714e25aad3195eb76fe44f7d03638f5a3d0a'
                                 + '13580fd5d3ca0f7604a3a50f663cb4fd23c214f1955fa5b3ee9ed5ed06bb70a3');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});

describe('[sparse-merkle-tree] Verify trick proofs', () => {
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
