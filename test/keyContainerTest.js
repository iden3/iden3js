const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

const kcutils = require('../src/keyContainer/kcutils');

let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('kcutils.encrypt', function() {
  it('encrypt', function() {
    let passphrase = 'this is a test passphrase';
    let key = kcutils.passToKey(passphrase, 'a');
    expect(key).to.be.equal('zBugsLjaZkbccvqBulbGlKAqzW4d8ikDO2yY46AP+4E=');

    let m = 'test';
    let c = kcutils.encrypt(key, m);
    let d = kcutils.decrypt(key, c);
    expect(d).to.be.equal(m);
  });
});

describe('kc.type', function() {
  let kcTest = new iden3.KeyContainer('teststorage');
  let kcLocalstorage = new iden3.KeyContainer('localstorage');

  it('type', function() {
    expect(kcTest.type).to.be.equal('teststorage');
    expect(kcLocalstorage.type).to.be.equal('localstorage');
  });
});

describe('new teststorageKeyContainer', function() {
  it('new teststorageKeyContainer', function() {
    let kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    let kc = new iden3.KeyContainer('teststorage');
    expect(kc.type).to.be.equal('teststorage');
  });
});

describe('testkc.importKey()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  it('imported key', function() {
    expect(iden3.utils.bytesToHex(kc.keys[key0])).to.be.equal('0xda7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8');
  });
});

describe('testkc.sign()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);

  let signatureObj = kc.sign(key0, 'test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('testkc.listKeys()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  let key1 = kc.generateKey();
  let key2 = kc.generateKey();
  let key3 = kc.generateKey();
  let key4 = kc.generateKey();

  it('testkc.listKeys', function() {
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key3);
    expect(kc.listKeys()[4]).to.be.equal(key4);
  });
});

describe('testkc.deleteKey()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0 = kc.importKey(testPrivKHex);
  let key1 = kc.generateKey();
  let key2 = kc.generateKey();
  let key3 = kc.generateKey();
  let key4 = kc.generateKey();

  it('testkc.deleteKey', function() {
    kc.deleteKey(key3);
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key4);
    expect(kc.listKeys().length).to.be.equal(4);
  });
});

describe('new localstorageKeyContainer', function() {
  it('new localstorageKeyContainer', function() {
    let kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    let testkc = new iden3.KeyContainer('teststorage');
    expect(testkc.type).to.be.equal('teststorage');
    let lskc = new iden3.KeyContainer('localstorage');
    expect(lskc.type).to.be.equal('localstorage');
  });
});

describe('localstoragekc.importKey()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  kc.deleteAll(); // delete all to do the test with empty localStorage
  let key0 = kc.importKey(testPrivKHex);
  it('imported key', function() {
    expect(key0).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
  kc.deleteAll();
});

describe('localstoragekc.sign()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  kc.deleteAll(); // delete all to do the test with empty localStorage
  let key0 = kc.importKey(testPrivKHex);

  let signatureObj = kc.sign(key0, 'test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
  kc.deleteAll();
});

describe('localstoragekc.listKeys()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  kc.deleteAll(); // delete all to do the test with empty localStorage
  it('localstoragekc.listKeys', function() {
    let key0 = kc.importKey(testPrivKHex);
    let key1 = kc.generateKey();
    let key2 = kc.generateKey();
    let key3 = kc.generateKey();
    let key4 = kc.generateKey();
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key3);
    expect(kc.listKeys()[4]).to.be.equal(key4);
    kc.deleteAll();
  });
});

describe('localstoragekc.deleteKey()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  kc.deleteAll(); // delete all to do the test with empty localStorage
  it('localstoragekc.deleteKey', function() {
    let key0 = kc.importKey(testPrivKHex);
    let key1 = kc.generateKey();
    let key2 = kc.generateKey();
    let key3 = kc.generateKey();
    let key4 = kc.generateKey();
    kc.deleteKey(key3);
    expect(kc.listKeys()[0]).to.be.equal(key0);
    expect(kc.listKeys()[1]).to.be.equal(key1);
    expect(kc.listKeys()[2]).to.be.equal(key2);
    expect(kc.listKeys()[3]).to.be.equal(key4);
    expect(kc.listKeys().length).to.be.equal(4);
    kc.deleteAll();
  });
});
