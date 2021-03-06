// canary to check that we are using the expected versions of external libraries, hash functions, elliptic curves, etc
// Checks the outputs of the iden3js crypto primitives with the circomlib outputs
// the test vectors are the same as in https://github.com/iden3/go-iden3-crypto
// Currently checks:
// - MiMC
// - Poseidon
// - BabyJubJub
// - SparseMerkleTree

const { expect } = require('chai');

const { bigInt } = require('snarkjs');
const circomlib = require('circomlib');
const poseidonCircomlib = circomlib.poseidon;
const smt = circomlib.smt;
const crypto = require('./crypto/crypto.js');
const {mimc7, poseidon} = crypto;
const utils = require('./utils');
const eddsa = require('./crypto/eddsa-babyjub.js');
const iden3 = require('../index');


describe('mimc7 primitives', () => {
  it('hash two bigInt', () => {
    const h = mimc7.hash([bigInt(12), bigInt(45)]);
    expect(h.toString()).to.be.equal('19746142529723647765530752502670948774458299263315590587358840390982005703908');
  });
  it('hash bigInt array (multiHash)', () => {
    const h1 = mimc7.multiHash([bigInt(12)]);
    expect(h1.toString()).to.be.equal('16051049095595290701999129793867590386356047218708919933694064829788708231421');

    const h2 = mimc7.multiHash([bigInt(78), bigInt(41)]);
    expect(h2.toString()).to.be.equal('2938611815373543102852102540059918590261345652613741345181300284995514063984');

    const h4 = mimc7.multiHash([bigInt(12), bigInt(45)]);
    expect(h4.toString()).to.be.equal('9949998637984578981906561631883120271399801229641312099559043216173958006905');

    const h5 = mimc7.multiHash([bigInt(12), bigInt(45), bigInt(78), bigInt(41)]);
    expect(h5.toString()).to.be.equal('18226366069841799622585958305961373004333097209608110160936134895615261821931');
  });

  it('mimc7 hash buffer', () => {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    const msgBuff = Buffer.from(msg, 'utf-8');
    const h = mimc7.hashBuffer(msgBuff);
    expect(h.toString()).to.be.equal('16855787120419064316734350414336285711017110414939748784029922801367685456065');
  });
});

describe('poseidon primitives', () => {
  it('poseidon two bigInt', () => {
    const poseidonHash = poseidonCircomlib.createHash();
    const h1 = poseidonHash([bigInt(1), bigInt(2)]);
    expect(h1.toString()).to.be.equal('12242166908188651009877250812424843524687801523336557272219921456462821518061');

    const h2 = poseidonHash([bigInt(3), bigInt(4)]);
    expect(h2.toString()).to.be.equal('17185195740979599334254027721507328033796809509313949281114643312710535000993');
  });

  it('poseidon bigInt array (multiHash)', () => {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    const msgBuff = Buffer.from(msg, 'utf-8');
    const n = 31;
    const msgArray = [];
    const fullParts = Math.floor(msgBuff.length / n);
    for (let i = 0; i < fullParts; i++) {
      const v = bigInt.leBuff2int(msgBuff.slice(n * i, n * (i + 1)));
      msgArray.push(v);
    }
    if (msgBuff.length % n !== 0) {
      const v = bigInt.leBuff2int(msgBuff.slice(fullParts * n));
      msgArray.push(v);
    }
    const h = poseidon.multiHash(msgArray);
    expect(h.toString()).to.be.equal('11821124228916291136371255062457365369197326845706357273715164664419275913793');
  });
  it('poseidon hash buffer', () => {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    const msgBuff = Buffer.from(msg, 'utf-8');
    const h = poseidon.hashBuffer(msgBuff);
    expect(h.toString()).to.be.equal('11821124228916291136371255062457365369197326845706357273715164664419275913793');
  });
});

describe('babyjubjub sign & verify with poseidonCircomlib', () => {
  const skHex = '0001020304050607080900010203040506070809000102030405060708090001';
  const sk = new eddsa.PrivateKey(utils.hexToBytes(skHex));

  const msgHex = '00010203040506070809';
  const msgBuff = utils.hexToBytes(msgHex);

  const msg = bigInt.leBuff2int(msgBuff);

  const pk = sk.public();
  const sig = sk.signMimc7(msg);
  it('pk.x', () => {
    expect(pk.p[0].toString()).to.be.equal('13277427435165878497778222415993513565335242147425444199013288855685581939618');
  });
  it('pk.y', () => {
    expect(pk.p[1].toString()).to.be.equal('13622229784656158136036771217484571176836296686641868549125388198837476602820');
  });
  it('sign', () => {
    expect(sig.r8[0].toString()).to.be.equal('11384336176656855268977457483345535180380036354188103142384839473266348197733');
    expect(sig.r8[1].toString()).to.be.equal('15383486972088797283337779941324724402501462225528836549661220478783371668959');
    expect(sig.s.toString()).to.be.equal('2523202440825208709475937830811065542425109372212752003460238913256192595070');
  });
  it('verify', () => {
    expect(pk.verifyMimc7(msg, sig)).to.be.equal(true);
  });
  it('compress & decompress', () => {
    const sigComp = sig.compress();
    expect(sigComp.toString('hex')).to.be.equal(''
      + 'dfedb4315d3f2eb4de2d3c510d7a987dcab67089c8ace06308827bf5bcbe02a2'
      + '7ed40dab29bf993c928e789d007387998901a24913d44fddb64b1f21fc149405');
    const sig2 = eddsa.Signature.newFromCompressed(sigComp);
    expect(pk.verifyMimc7(msg, sig2)).to.be.equal(true);
  });
});

function newEntry(arr) {
  return {
    hi: poseidon.multiHash(arr.slice(2)),
    hv: poseidon.multiHash(arr.slice(0, 2)),
  };
}
function entryFromInts(e0, e1, e2, e3) {
  return iden3.claim.Entry.newFromBigInts(bigInt(e0), bigInt(e1), bigInt(e2), bigInt(e3));
}

const db = new iden3.Db.Memory();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

describe('sparse-merkle-tree Add Claim', () => {
  it('add one claim', async () => {
    const tree = await smt.newMemEmptyTrie();
    const claim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    const entries = newEntry(claim);
    const key1 = entries.hi;
    const value1 = entries.hv;

    await tree.insert(key1, value1);
    expect(tree.root.toString(16)).to.be.equal('2ab68ca530d96aa00eafb1b1f40aa2ed0c8ce6e7aec8bed48b7efd52e919f91b');

    // check same output with iden3js version
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const claim1 = entryFromInts(12, 45, 78, 41);
    mt.addEntry(claim1);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal(`0x${tree.root.toString(16)}`);
  });
  it('add two claims', async () => {
    const firstClaim = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
    const firstEntries = newEntry(firstClaim);
    const secondClaim = [bigInt(33), bigInt(44), bigInt(55), bigInt(66)];
    const secondEntries = newEntry(secondClaim);
    const tree = await smt.newMemEmptyTrie();
    const key1 = firstEntries.hi;
    const value1 = firstEntries.hv;
    const key2 = secondEntries.hi;
    const value2 = secondEntries.hv;

    await tree.insert(key1, value1);
    await tree.insert(key2, value2);
    expect(tree.root.toString(16)).to.be.equal('f42da5cbc007dcf89c72ba7212e078c00aba09e9b8d6114515b56daacca95dd');

    // check same output with iden3js version
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);
    const firstClaim1 = entryFromInts(12, 45, 78, 41);
    mt.addEntry(firstClaim1);
    const secondClaim1 = entryFromInts(33, 44, 55, 66);
    mt.addEntry(secondClaim1);
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal(`0x0${tree.root.toString(16)}`);
  });
});
