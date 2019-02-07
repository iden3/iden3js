const chai = require('chai');
const iden3 = require('../index');
const smtUtils = require('./sparse-merkle-tree-utils');

const { expect } = chai;

// new database
const db = new iden3.Db();

// claimsDump is the dump of claims from the go-iden3, using merkletree.Walk function, in the TestMTWalkDumpClaims() test function in the go-iden3/merkletree/merkletree_test.go
const claimsDump = [
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031342d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500382d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500302d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500332d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500342d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500362d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031322d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031312d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031302d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031352d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500372d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500392d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x01007465737474657374746573747465737474657374746573747465737474657300747465737474657374746573747465737474657374746573747465737474650031332d746573747465737474657374746573747465737474657374746573740074657374746573747465737474657374746573000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500312d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500352d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
  '0x010074657374746573747465737474657374746573747465737474657374746573007474657374746573747465737474657374746573747465737474657374746500322d74657374746573747465737474657374746573747465737474657374740065737474657374746573747465737474657374000000000000000000000000',
];

describe('[merkle-tree] Import claims', () => {
  it('add claims', () => {
    const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, 'testprefix');

    smtUtils.importClaimsDump(mt, claimsDump);

    // check that the mt.root is equal to the RootKey of a MerkleTree in go-iden3 containing the same claims
    expect(iden3.utils.bytesToHex(mt.root)).to.be.equal('0x29ee40db2ef12076a5efcc415b6d7f61fb3bde7d2476c8400c94ba8f0aa32465');
  });
});
