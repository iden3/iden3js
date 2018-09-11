const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');


describe('checkProof()', function() {
  it('checkProof()', function() {
    let rootHex = "0x7d7c5e8f4b3bf434f3d9d223359c4415e2764dd38de2e025fbf986e976a7ed3d";
    let mpHex = "0x0000000000000000000000000000000000000000000000000000000000000002d45aada6eec346222eaa6b5d3a9260e08c9b62fcf63c72bc05df284de07e6a52";
    let hiHex = "0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878";
    let htHex = "0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878";
    let verified = iden3.merkletree.checkProof(rootHex, mpHex, hiHex, htHex, 140);
    expect(verified).to.be.equal(true);
  });
});
