const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new KeyContainer', function() {
  it('new teststorage KeyContainer', function() {
    let kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    let kc = new iden3.KeyContainer('teststorage');
    expect(kc.type).to.be.equal('teststorage');
  });
});

describe('kc.importKey()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  it('imported key', function() {
    expect(iden3.utils.bytesToHex(kc.keys[key0])).to.be.equal('0xda7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8');
  });
});

describe('kc.sign()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);

  let signatureObj = kc.sign(key0, 'test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('kc.listKeys()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  let key1 = kc.generateKey();
  let key2 = kc.generateKey();
  let key3 = kc.generateKey();
  let key4 = kc.generateKey();

  it('listKeys', function() {
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key3);
    expect(kc.listKeys()[4]).to.be.equal(key4);
  });
});

describe('kc.deleteKey()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  let key1 = kc.generateKey();
  let key2 = kc.generateKey();
  let key3 = kc.generateKey();
  let key4 = kc.generateKey();

  it('deleteKey', function() {
    kc.deleteKey(key3);
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key4);
    expect(kc.listKeys().length).to.be.equal(4);
  });
});
