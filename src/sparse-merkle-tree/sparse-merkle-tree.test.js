const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('./sparse-merkle-tree-utils');
const mimc7 = require('./mimc7');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db.Memory();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

describe('[sparse-merkle-tree] Empty tree', () => {
  it('should be empty', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('[sparse-merkle-tree] Mimc7 hash function', () => {
  it('hash array 2 bigInts', () => {
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    const hi = mimc7.multiHash(claim.slice(2));
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hi));
    expect(hiHex).to.be.equal('0x067f3202335ea256ae6e6aadcd2d5f7f4b06a00b2d1e0de903980d5ab552dc70');
    const hv = mimc7.multiHash(claim.slice(0, 2));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hv));
    expect(hvHex).to.be.equal('0x15ff7fe9793346a17c3150804bcb36d161c8662b110c50f55ccb7113948d8879');
  });
});

describe('[sparse-merkle-tree] Mimc7 hash function', () => {
  it('hash array 4 bigInts', () => {
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    const hi = mimc7.multiHash(claim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hi));
    expect(hiHex).to.be.equal('0x284bc1f34f335933a23a433b6ff3ee179d682cd5e5e2fcdd2d964afa85104beb');
  });
});


describe('[sparse-merkle-tree] Add Claim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2bf39430aa2482fc1e2f170179c8cab126b0f55f71edc8d333f4c80cb4e798f5');
  });
});

describe('[sparse-merkle-tree] Add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x18cbbb4a507b66fb20c7f7548629e38ceba0d4feb61c709d3655128fd2cb86c1');
  });
});

describe('[sparse-merkle-tree] Add claims in different orders into two different trees', () => {
  it('add claims in different orders into two trees', () => {
    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 16; i++) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(i)];
      mt1.addClaim(claim);
    }

    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 15; i >= 0; i--) {
      const claim = [bigInt(0), bigInt(i), bigInt(0), bigInt(i)];
      mt2.addClaim(claim);
    }
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x2f398ded371e7ecd5b1728ce86aba7398272728c2a6d685ae37df0f7645bf254');
  });
});

describe('[sparse-merkle-tree] Add claims in different orders into six different trees', () => {
  it('add claims in differnet orders into six trees', () => {
    const claim1 = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    const claim2 = [bigInt(1111), bigInt(2222), bigInt(3333), bigInt(4444)];
    const claim3 = [bigInt(5555), bigInt(6666), bigInt(7777), bigInt(8888)];

    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt3 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt4 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt5 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt6 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);

    mt1.addClaim(claim1);
    mt1.addClaim(claim2);
    mt1.addClaim(claim3);

    mt2.addClaim(claim1);
    mt2.addClaim(claim3);
    mt2.addClaim(claim2);

    mt3.addClaim(claim2);
    mt3.addClaim(claim1);
    mt3.addClaim(claim3);

    mt4.addClaim(claim2);
    mt4.addClaim(claim3);
    mt4.addClaim(claim1);

    mt5.addClaim(claim3);
    mt5.addClaim(claim1);
    mt5.addClaim(claim2);

    mt6.addClaim(claim3);
    mt6.addClaim(claim2);
    mt6.addClaim(claim1);

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt2.root)).to.be.equal(iden3.utils.bytesToHex(mt3.root));
    expect(iden3.utils.bytesToHex(mt3.root)).to.be.equal(iden3.utils.bytesToHex(mt4.root));
    expect(iden3.utils.bytesToHex(mt4.root)).to.be.equal(iden3.utils.bytesToHex(mt5.root));
    expect(iden3.utils.bytesToHex(mt5.root)).to.be.equal(iden3.utils.bytesToHex(mt6.root));

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x1e7ffefed4328846685d84eaf78c73e42a818a84ddbfeb8005ca1aeb6cfdf158');
  });
});


describe('[sparse-merkle-tree] Get claim by its index', () => {
  it('getClaimByHi', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
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
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const proof = mt.generateProof(firstClaim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
  it('with 4 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0005000000000000000000000000000000000000000000000000000000000011'
                                                      + '19b861dd1137c0355e2387a4485c5be6fb6e96b58bbbd6ec3dc0685aac6ab21b'
                                                      + '1db94892d26681f45bd59a26d9b63b4a3b72e49426cc99413de511ce936d0ea2');
  });
  it('with 64 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x00080000000000000000000000000000000000000000000000000000000000ff'
                                                      + '27d4dd8a257bfdf256f2228d5d0efe1e76f122724d6b758fcb955e29eca181b5'
                                                      + '19ef7310fb6f536f3bae38426596bafe09565f6a5e10a6a00b15b6ea2a358dcb'
                                                      + '0dbc0dbdf300d56b3f856c857143078885be23c9f4af5858e01f744ce786a8af'
                                                      + '255374c08e2fb29e5b718d47ba53cd59cc8865c5e83601c2e12e097416b75a81'
                                                      + '13f5e61b352fe2e8214e11c8c8cb955a40908b4821806be4f8cc44c4a7da5d93'
                                                      + '044d24b423c6812821268c877b68c9a6a5e8e027a2ec5622091544a9a1efd861'
                                                      + '2c29b6a10a02185110721050ff704afac110e0c1d843bac8b6649252eb8af9d6'
                                                      + '07138a66cae812df472805aadd26784e0da092bbdba296e7700268d6f6812bd8');
  });
});

describe('[sparse-merkle-tree] Verify proof', () => {
  it('proof-of-existence', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(4)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0007000000000000000000000000000000000000000000000000000000000043'
                                 + '0b17095aa925dc78a07fdb53f1589890d018b61d9ec2dedc800ffd5a06c6d37a'
                                 + '137d66cc357c7ce5d3b8dd239492f04a84c189c7784a081e705def9846ac7d02'
                                 + '1f777df2736b8f339bc822ce0e82681c3d5712d6c8c1681b9f8a8da33f027bd3');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence non empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(10)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0103000000000000000000000000000000000000000000000000000000000007'
                                 + '0b17095aa925dc78a07fdb53f1589890d018b61d9ec2dedc800ffd5a06c6d37a'
                                 + '137d66cc357c7ce5d3b8dd239492f04a84c189c7784a081e705def9846ac7d02'
                                 + '12ad30ae8e4ba3c5bed549923763c6cdf1d32466fba659448ce987a6b6cf3d08');

    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const proofClaim = [bigInt(0), bigInt(0), bigInt(0), bigInt(12)];
    const proof = mt.generateProof(proofClaim.slice(2));

    const hashes = iden3.sparseMerkleTree.getHiHv(proofClaim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0307000000000000000000000000000000000000000000000000000000000043'
                                 + '0b17095aa925dc78a07fdb53f1589890d018b61d9ec2dedc800ffd5a06c6d37a'
                                 + '137d66cc357c7ce5d3b8dd239492f04a84c189c7784a081e705def9846ac7d02'
                                 + '1f777df2736b8f339bc822ce0e82681c3d5712d6c8c1681b9f8a8da33f027bd3'
                                 + '2bd5a51b497073b952be60de9a83802c64c49aececbd504cbc8269bef021e9e6'
                                 + '06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6');

    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});

describe('[sparse-merkle-tree] Verify trick proofs', () => {
  it('invalid claim argument', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(false);
  });
  it('invalid non-existence proof', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const hashesBuff = Buffer.concat(iden3.utils.getArrayBuffFromArrayBigIntBE(hashes));
    objectProof.metaData = hashesBuff;
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(false);
  });
});

describe('[sparse-merkle-tree] Add Claim Repeated', () => {
  it('add one claim multiple times', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(claim);

    expect(() => { mt.addClaim(claim); }).to.throw('maxLevels reached');
    expect(() => { mt.addClaim(claim); }).to.throw('maxLevels reached');
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2bf39430aa2482fc1e2f170179c8cab126b0f55f71edc8d333f4c80cb4e798f5');

    const proof = mt.generateProof(claim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

    const hashes = iden3.sparseMerkleTree.getHiHv(claim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});
