import { Entry } from '../claim/entry';

const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const { poseidon } = require('../crypto/crypto.js');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db.Memory();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

function entryFromInts(e0, e1, e2, e3) {
  return Entry.newFromBigInts(bigInt(e0), bigInt(e1), bigInt(e2), bigInt(e3));
}

describe('[sparse-merkle-tree] Empty tree', () => {
  it('should be empty', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('[sparse-merkle-tree] Mimc7 hash function', () => {
  it('hash array 2 bigInts', () => {
    const claim = entryFromInts(12, 45, 78, 41);
    const hi = claim.hi();
    const hiHex = iden3.utils.bytesToHex(hi);
    expect(hiHex).to.be.equal('0x20555fb8cece3be661b574f3788f7bc44a404c133ade1af360fb2027f7823330');
    const hv = claim.hv();
    const hvHex = iden3.utils.bytesToHex(hv);
    expect(hvHex).to.be.equal('0x12454840a1636394058e3b83e69339d036385d654aeeeb56664f225d8c93e748');
  });
});

describe('[sparse-merkle-tree] Mimc7 hash function', () => {
  it('hash array 4 bigInts', () => {
    const claim = entryFromInts(12, 45, 78, 41);
    // const h = mimc7.multiHash(iden3.utils.getArrayBigIntFromBuffArrayBE(claim.elements));
    const h = poseidon.multiHash(iden3.utils.getArrayBigIntFromBuffArrayBE(claim.elements));
    const hHex = iden3.utils.bytesToHex(iden3.utils.bigIntToBufferBE(h));
    expect(hHex).to.be.equal('0x149ce1812eb8bd8bf4b81a81f667faf0c89412705eadcb9153185cbe7ac246f6');
  });
});

describe('[sparse-merkle-tree] Add Claim', () => {
  it('add one claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(claim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x110f16ef0b11d0aa41ae0bd0eec2627f12f33d4a8cf606e2b657e36fe5c515b4');
  });
});

describe('[sparse-merkle-tree] Add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(firstClaim);
    const secondClaim = entryFromInts(33, 44, 55, 66);
    mt.addEntry(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x1e8fcfb4603380099b1f8fc56907ccf9f49d8ab2a517ced79c6ee06b70a97282');
  });
});

describe('[sparse-merkle-tree] Add claims in different orders into two different trees', () => {
  it('add claims in different orders into two trees', () => {
    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 16; i++) {
      const claim = entryFromInts(0, i, 0, i);
      mt1.addEntry(claim);
    }

    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 15; i >= 0; i--) {
      const claim = entryFromInts(0, i, 0, i);
      mt2.addEntry(claim);
    }
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x1c153a4bf4148db686bc2b46026ea0928bb9cd2ae825670b34025e560996b1a7');
  });
});

describe('[sparse-merkle-tree] Add claims in different orders into six different trees', () => {
  it('add claims in differnet orders into six trees', () => {
    const claim1 = entryFromInts(33, 44, 55, 66);
    const claim2 = entryFromInts(1111, 2222, 3333, 4444);
    const claim3 = entryFromInts(5555, 6666, 7777, 8888);

    const mt1 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt2 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt3 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt4 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt5 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const mt6 = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);

    mt1.addEntry(claim1);
    mt1.addEntry(claim2);
    mt1.addEntry(claim3);

    mt2.addEntry(claim1);
    mt2.addEntry(claim3);
    mt2.addEntry(claim2);

    mt3.addEntry(claim2);
    mt3.addEntry(claim1);
    mt3.addEntry(claim3);

    mt4.addEntry(claim2);
    mt4.addEntry(claim3);
    mt4.addEntry(claim1);

    mt5.addEntry(claim3);
    mt5.addEntry(claim1);
    mt5.addEntry(claim2);

    mt6.addEntry(claim3);
    mt6.addEntry(claim2);
    mt6.addEntry(claim1);

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal(iden3.utils.bytesToHex(mt2.root));
    expect(iden3.utils.bytesToHex(mt2.root)).to.be.equal(iden3.utils.bytesToHex(mt3.root));
    expect(iden3.utils.bytesToHex(mt3.root)).to.be.equal(iden3.utils.bytesToHex(mt4.root));
    expect(iden3.utils.bytesToHex(mt4.root)).to.be.equal(iden3.utils.bytesToHex(mt5.root));
    expect(iden3.utils.bytesToHex(mt5.root)).to.be.equal(iden3.utils.bytesToHex(mt6.root));

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x107f52fc0aa955dfcec2c23d38ca75f8ccbb339e4f5d56e384f13e3fc7f38a29');
  });
});


describe('[sparse-merkle-tree] Get claim by its index', () => {
  it('getEntryByHi', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(firstClaim);
    const secondClaim = entryFromInts(33, 44, 55, 66);
    mt.addEntry(secondClaim);
    const totalClaim = mt.getEntryByHi(secondClaim.hiBigInt());
    // Compare claim fields
    expect(totalClaim.elements[0].toString('hex')).to.be.equal(secondClaim.elements[0].toString('hex'));
    expect(totalClaim.elements[1].toString('hex')).to.be.equal(secondClaim.elements[1].toString('hex'));
    expect(totalClaim.elements[2].toString('hex')).to.be.equal(secondClaim.elements[2].toString('hex'));
    expect(totalClaim.elements[3].toString('hex')).to.be.equal(secondClaim.elements[3].toString('hex'));
  });
});

describe('[sparse-merkle-tree] Generate proof', () => {
  it('with 1 claim', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(firstClaim);
    const proof = mt.generateProof(firstClaim.hiBigInt());
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
  it('with 4 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 4; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 2);
    const totalClaim = mt.getEntryByHi(proofClaim.hiBigInt());
    expect(totalClaim.elements[0].toString('hex')).to.be.equal(proofClaim.elements[0].toString('hex'));
    expect(totalClaim.elements[1].toString('hex')).to.be.equal(proofClaim.elements[1].toString('hex'));
    expect(totalClaim.elements[2].toString('hex')).to.be.equal(proofClaim.elements[2].toString('hex'));
    expect(totalClaim.elements[3].toString('hex')).to.be.equal(proofClaim.elements[3].toString('hex'));

    const proof = mt.generateProof(proofClaim.hiBigInt());
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000100000000000000000000000000000000000000000000000000'
                                                      + '0000000001221b00f66ba364db27c73ec49e0e7d82967377ccffc88'
                                                      + '34b1918cf771dc1be70');
  });
  it('with 64 claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 64; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 4);
    const totalClaim = mt.getEntryByHi(proofClaim.hiBigInt());
    expect(totalClaim.elements[0].toString('hex')).to.be.equal(proofClaim.elements[0].toString('hex'));
    expect(totalClaim.elements[1].toString('hex')).to.be.equal(proofClaim.elements[1].toString('hex'));
    expect(totalClaim.elements[2].toString('hex')).to.be.equal(proofClaim.elements[2].toString('hex'));
    expect(totalClaim.elements[3].toString('hex')).to.be.equal(proofClaim.elements[3].toString('hex'));

    const proof = mt.generateProof(proofClaim.hiBigInt());
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000a00000000000000000000000000000000000000000000000000000000022f'
                                                      + '2f09940bfa44f80581f9c0838237d1e0d77f7c814aab1877820924a6eb094f2b'
                                                      + '20a07c3217c7866e5411fc4ffd3bd12835b5f2fc67637deb8b5f02f041723ba4'
                                                      + '244235812394c4141384b5c673d23396997a2652ef6892629237ca7270828ad2'
                                                      + '1993e3f5b654a9d6994bfed9c31bed120ae4d6a71d2f503b5d806098996af182'
                                                      + '2b61f62e9de34c8f1e04680546b9a1654a928d2e014db3ea9326999cf7815c3c'
                                                      + '183a9ab8eed2c36a38830b6fb950472dc7c25db4b72607fc874246fbac45a3fe');
  });
});

describe('[sparse-merkle-tree] Verify proof', () => {
  it('proof-of-existence', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 4);
    const proof = mt.generateProof(proofClaim.hiBigInt());

    const hiHex = iden3.utils.bytesToHex(proofClaim.hi());
    const hvHex = iden3.utils.bytesToHex(proofClaim.hv());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f2d8cfb5725122e6bd73dd2723d58d906808159c0ceba88299f7000551b1d4491261eadbb3ad609b5fc596d2f084f2ea23d27c18b12b20504c12018c35d9832fa2d97d5a2f16807fb8373da7c0f6b2f7faecd98de94dfb405f7eaca2288d62b6a2ef5dbb583c90dbc637684def62522fcef265f949dfc5e06d438f5cf72b1de46');
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence non empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 10);
    const proof = mt.generateProof(proofClaim.hiBigInt());

    const hiHex = iden3.utils.bytesToHex(proofClaim.hi());
    const hvHex = iden3.utils.bytesToHex(proofClaim.hv());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x030400000000000000000000000000000000000000000000000000000000000b'
                                  + '2d8cfb5725122e6bd73dd2723d58d906808159c0ceba88299f7000551b1d449'
                                  + '12de3d12de54d01da2297df060dc9b91709855e1051a8e75e54cb9549b3c112'
                                  + '4a1daa108eb11f735360058608ab8f5f05603d569a5dbe5e19243ceb47f99e0'
                                  + '96a17ddf6f66c73719745eeca828537ee30394123a28d16eb51cf51f3bcc0bd'
                                  + '03a3021a76d5f2cdcf354ab66eff7b4dee40f02501545def7bb66b3502ae68e1b781');

    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
  it('proof-of-non-existence empty node value', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 12);
    const proof = mt.generateProof(proofClaim.hiBigInt());

    const hiHex = iden3.utils.bytesToHex(proofClaim.hi());
    const hvHex = iden3.utils.bytesToHex(proofClaim.hv());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    expect(proofHex).to.be.equal('0x010500000000000000000000000000000000000000000000000000000000001'
                                + 'f2d8cfb5725122e6bd73dd2723d58d906808159c0ceba88299f7000551b1d449'
                                + '1261eadbb3ad609b5fc596d2f084f2ea23d27c18b12b20504c12018c35d9832f'
                                + 'a2d97d5a2f16807fb8373da7c0f6b2f7faecd98de94dfb405f7eaca2288d62b6'
                                + 'a2522302b07cf9f12426558f1882e41a0bf4e86b281680442a13600528f8880f'
                                + 'f1c938504f6e27838cac27ef3b4c16c5d8ba0b86523bf83142edbbe18693691d2');

    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});

describe('[sparse-merkle-tree] Verify trick proofs', () => {
  it('invalid claim argument', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 0, 0, 4);
    // Generate proof of an existing node
    const proof = mt.generateProof(proofClaim.hiBigInt());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    // Verify proof with node mismatch between generated proof and  node used for verification
    const proofClaimFalse = entryFromInts(0, 5, 0, 5);
    const hiHex = iden3.utils.bytesToHex(proofClaimFalse.hi());
    const hvHex = iden3.utils.bytesToHex(proofClaimFalse.hv());
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(false);
  });
  it('invalid non-existence proof', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    for (let i = 0; i < 8; i++) {
      const claim = entryFromInts(0, 0, 0, i);
      mt.addEntry(claim);
    }
    const proofClaim = entryFromInts(0, 4, 0, 4);
    const proof = mt.generateProof(proofClaim.hiBigInt());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    // const objectProof = helpers.parseProof(proofHex);
    // Manipulate proof from existence to non-existence
    // and adding node metadata as auxiliary node
    // objectProof.flagExistence = true;
    const hiHex = iden3.utils.bytesToHex(proofClaim.hi());
    const hvHex = iden3.utils.bytesToHex(proofClaim.hv());
    // const hashesBuff = Buffer.concat(iden3.utils.getArrayBuffFromArrayBigIntBE(hashes));
    // objectProof.metaData = hashesBuff;
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(false);
  });
});

describe('[sparse-merkle-tree] Add Claim Repeated', () => {
  it('add one claim multiple times', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(claim);

    expect(() => { mt.addEntry(claim); }).to.throw('maxLevels reached');
    expect(() => { mt.addEntry(claim); }).to.throw('maxLevels reached');
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x110f16ef0b11d0aa41ae0bd0eec2627f12f33d4a8cf606e2b657e36fe5c515b4');

    const proof = mt.generateProof(claim.hiBigInt());
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

    const hiHex = iden3.utils.bytesToHex(claim.hi());
    const hvHex = iden3.utils.bytesToHex(claim.hv());
    const rootHex = iden3.utils.bytesToHex(mt.root);
    const proofHex = iden3.utils.bytesToHex(proof);
    const check = iden3.sparseMerkleTree.checkProof(rootHex, proofHex, hiHex, hvHex);
    expect(check).to.be.equal(true);
  });
});
