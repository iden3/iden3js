const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('checkProof()', function() {
  it('checkProof 1', function() {
    let rootHex = '0x7d7c5e8f4b3bf434f3d9d223359c4415e2764dd38de2e025fbf986e976a7ed3d';
    let mpHex = '0x0000000000000000000000000000000000000000000000000000000000000002d45aada6eec346222eaa6b5d3a9260e08c9b62fcf63c72bc05df284de07e6a52';
    let hiHex = '0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878';
    let htHex = '0x786677808ba77bdd9090a969f1ef2cbd1ac5aecd9e654f340500159219106878';
    let verified = iden3.merkletree.checkProof(rootHex, mpHex, hiHex, htHex, 140);
    expect(verified).to.be.equal(true);
  });
  it('checkProof 2', function() {
    let kc = new iden3.KeyContainer(testPrivKHex);
    let id = new iden3.Id(kc);
    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', id.kc.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350);
    let hiHex = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
    let htHex = iden3.utils.bytesToHex(authorizeKSignClaim.ht());
    let mpHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    let rootHex = '0xd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207';
    let verified = iden3.merkletree.checkProof(rootHex, mpHex, hiHex, htHex, 140);
    expect(verified).to.be.equal(true);
  });
});
