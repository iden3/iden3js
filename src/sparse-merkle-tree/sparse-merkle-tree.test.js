const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');
const { poseidon } = require('../crypto/crypto.js');

const { bigInt } = snarkjs;
const { expect } = chai;

const db = new iden3.Db.Memory();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

function entryFromInts(e0, e1, e2, e3) {
  return iden3.claim.Entry.newFromBigInts(bigInt(e0), bigInt(e1), bigInt(e2), bigInt(e3));
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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2ab68ca530d96aa00eafb1b1f40aa2ed0c8ce6e7aec8bed48b7efd52e919f91b');
  });
});

describe('[sparse-merkle-tree] Add two claims', () => {
  it('adding two claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim = entryFromInts(12, 45, 78, 41);
    mt.addEntry(firstClaim);
    const secondClaim = entryFromInts(33, 44, 55, 66);
    mt.addEntry(secondClaim);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x0f42da5cbc007dcf89c72ba7212e078c00aba09e9b8d6114515b56daacca95dd');
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
    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x27de12d35c012988b4fcc275829217c79ae1a2322634ebead16afccd95ffd6fc');
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

    expect(iden3.utils.bytesToHex(mt1.root)).to.be.equal('0x182cc2d953d6376ffdf2c0ed65f306c95ebc61c2358dacc94e85ceabde9dde7e');
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
    expect(iden3.utils.bytesToHex(proof)).to.be.equal('0x000100000000000000000000000000000000000000000000000000000000000'
                                                      + '1255b46f58791e3d5220cc9fecfaf2750a02fb8f6135b4561af541dc0ebfe080d');
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
                                                      + '0a5fbf7d26e753c9fff385ff56484d19f526e770f653653a76f44f0f9d282178'
                                                      + '21eeecff4ffeee35051fb5d7aded04885cbd9a1b7de89a384543cb2e076a7968'
                                                      + '255ef74595c3c548c7a31520e90e7978a059fce4914cbee071262731aa6ba9ea'
                                                      + '1e3fe0e032a292052a300ac3012c4053aadb5c6122d953834e3eb23580bd4565'
                                                      + '12c1f7e29dfedf21d5acd1e01f86d9bfaaaa2657b25bacbab3fc3899e43bf372'
                                                      + '08e3ecd1496bd3a4b74babe63a81032898c46b8145ebfe0176de4ede8e868069');
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
    expect(proofHex).to.be.equal('0x000400000000000000000000000000000000000000000000000000000000000f12a103b79aa775d294a27c32dbbee228f04f0dde5f8f39a8bdea0ac99623eb9d1e38815ed13fa58751bb8d6474e554a59f9f89a8046f085e257379871a65138c1f735fbdc197cc1b1a3aee2f96eb6cb11f37cafd253811e6ca8a0464744394a907ee92c7377df5e038dc2092eb643820c50e98a6f2f6f2ea285d4a84d29c1718');
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
    expect(proofHex).to.be.equal('0x030400000000000000000000000000000000000000000000000000000000000b1'
                                  + '2a103b79aa775d294a27c32dbbee228f04f0dde5f8f39a8bdea0ac99623eb9d2'
                                  + '1505710a088ff53242477c909cbdf0bb7753eb15c76fb3862ab6b3da80dfb672'
                                  + '65d97df25853b130e1769fb421277c93a286487a0876b29db6e87d344e5b2711'
                                  + '7ddf6f66c73719745eeca828537ee30394123a28d16eb51cf51f3bcc0bd03a30'
                                  + '21a76d5f2cdcf354ab66eff7b4dee40f02501545def7bb66b3502ae68e1b781');

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
    expect(proofHex).to.be.equal('0x010500000000000000000000000000000000000000000000000000000000001f'
                                  + '12a103b79aa775d294a27c32dbbee228f04f0dde5f8f39a8bdea0ac99623eb9'
                                  + 'd1e38815ed13fa58751bb8d6474e554a59f9f89a8046f085e257379871a6513'
                                  + '8c1f735fbdc197cc1b1a3aee2f96eb6cb11f37cafd253811e6ca8a046474439'
                                  + '4a91e031226a2e76231b4c29a182a0083c495b7fdf712ee6df9f030b7212abb'
                                  + '925d2b2e10bd6e4ba7b655949bca7da3b36e751f0e989c495cb9f9d2c8f884b3e73f');

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
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x2ab68ca530d96aa00eafb1b1f40aa2ed0c8ce6e7aec8bed48b7efd52e919f91b');

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

describe('[sparse-merkle-tree] Max levels reached', () => {
  it('find collision before max levels are reached', () => {
    const maxLevels = 3;
    const maxLeafs = 2 ** maxLevels;
    let i;
    for (let n = 0; n < 25; n++) {
      const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, 'idAddr', maxLevels);
      try {
        for (i = 0; i < maxLeafs + 1; i++) {
          const entry = entryFromInts(0, i, 0, Math.floor((Math.random() * 100) + 1));
          mt.addEntry(entry);
        }
      } catch (err) {
        expect((err.message).includes('maxLevels reached')).to.be.equal(true);
      }
      expect(i).to.be.below(maxLeafs);
    }
  });
});
