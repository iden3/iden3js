const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('./sparse-merkle-tree-utils');
const mimc7 = require('./mimc7');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

describe('[sparse-merkle-tree] Empty tree', () => {
  it('should be empty', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('[sparse-merkle-tree] Mimc7 hash function', () => {
  it('hash array bigInts', () => {
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    const hi = mimc7.multiHash(claim.slice(2));
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hi));
    expect(hiHex).to.be.equal('0x1fd4bc970a697084ec1f83ecf81936d4a047e27c654752ddbc89f9ed1728e0ab');
    const hv = mimc7.multiHash(claim.slice(0, 2));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hv));
    expect(hvHex).to.be.equal('0x263924eb9ae730cea9ce31bb9ada695ec3525536b4c058813552b074db36ba9a');
  });
});


describe('[sparse-merkle-tree] Add Claim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x112bae1c89a7a51a9a09e88c2f095bfe8a7d94d7c0cf5ba017a491c3e0b95c8f');
  });
});

describe('[sparse-merkle-tree] Add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    mt.addClaim(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    mt.addClaim(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1fb755a3677f8fd6c47b5462b69778ef6383c31d2d498b765e953f8cacaa6744');
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
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x173fd27f6622526dfb21c4d8d83e3c95adba5d8f46a397113e4e80e629c6de76');
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

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x27990ef22656f49f010b2b48b2418c46f2bc93e4afb2e3377a1eb09f129e9802');
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0001000000000000000000000000000000000000000000000000000000000001'
                                                      + '05086d2d031b3aeb91b850c7a0280499ded7ba4b8b25caffff5dc754ed207eb8');
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000700000000000000000000000000000000000000000000000000000000005f'
                                                      + '1a412100b0a427796bf11048f3759c9c2163dc39f44d2b243dd8d8fee531800d'
                                                      + '21284e40a8d3e9658d429ebedbef7d509de684b9143aac0b1be3c3979a4e5ed0'
                                                      + '005844e6e7d83169766472da339496a1663ebc14a1016dd39105ca13848f68d4'
                                                      + '102e955ce94001fa069fdd144a3fda637020dd21f1a4a9f23ae0665a4ed27457'
                                                      + '28b82cce3a8d858c295e42c8f058b4a73ca39b0222754165db9f8c7ecf5f431a'
                                                      + '1e220bd9bea43d106d41b7bc2a5d2e88d0fc4f0429c3f8de7059a0bf93e40212');
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0003000000000000000000000000000000000000000000000000000000000007'
                                 + '2e2e61a54ec48cb031effbf00420cd06d707535616965f1ffda2edd1006b807c'
                                 + '0b9a1a9cc13e5fe12e380fb702c10fde1a9201b7f89e25051f57e00862f20522'
                                 + '00b1574ea5a96e97ff7b0c964c14d0ad7b9da5b56d068b3aabe10fd3051b0d2a');
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x030400000000000000000000000000000000000000000000000000000000000b'
                                 + '0a439bd423b069c01717cd8641d610f286ec5062c9ecee6f2412af76ff551cb5'
                                 + '1c0fd5c25407d0220a0bcbc6734908153fd18ec43ee62ee157030462c43f537d'
                                 + '2d5899d3a66630d86c3b9ff896a99b0f2b9e7afc49b69175ed07773ae39263f5'
                                 + '149648851923be5e707629f0619a1f391452d3c252291d5492d5f9280542380f'
                                 + '1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed');
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x0105000000000000000000000000000000000000000000000000000000000017'
                                 + '2e2e61a54ec48cb031effbf00420cd06d707535616965f1ffda2edd1006b807c'
                                 + '0b9a1a9cc13e5fe12e380fb702c10fde1a9201b7f89e25051f57e00862f20522'
                                 + '1e1b8f66c3bd26be093e358ed6c54f9d1986411ea404d01482fcf26b04912a0c'
                                 + '17974735b062a464506127e92858392e853b6abbcb3a1d93a5924af42198c3d1');
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
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
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
    const hashesBuff = Buffer.concat(iden3.utils.getArrayBuffFromArrayBigInt(hashes));
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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x112bae1c89a7a51a9a09e88c2f095bfe8a7d94d7c0cf5ba017a491c3e0b95c8f');

    const proof = mt.generateProof(claim.slice(2));
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

    const hashes = iden3.sparseMerkleTree.getHiHv(claim);
    const hiHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[0]));
    const hvHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBuffer(hashes[1]));
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});
