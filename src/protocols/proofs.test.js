// @flow
import { describe, it } from 'mocha';
import { Entry } from '../claim/entry';

const chai = require('chai');
const snarkjs = require('snarkjs');
const iden3 = require('../index');

const { bigInt } = snarkjs;
const { expect } = chai;

function entryFromInts(e0, e1, e2, e3) {
  return Entry.newFromBigInts(bigInt(e0), bigInt(e1), bigInt(e2), bigInt(e3));
}

const db = new iden3.Db.Memory();
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';

describe('[proofs] ProofClaim', () => {
  it('nonce', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr, 140);

    const claim1 = entryFromInts(33, 44, 55, 66);
    const claim2 = entryFromInts(1111, 2222, 3333, 4444);
    const claim3 = entryFromInts(5555, 6666, 7777, 8888);

    mt.addEntry(claim1);
    mt.addEntry(claim2);
    mt.addEntry(claim3);

    const proofClaim = iden3.protocols.getProofClaimByHi(mt, claim1.hiBigInt());
    expect(proofClaim).to.be.not.equal(undefined);
  });
});
