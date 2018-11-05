const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
let testPrivKHex1 = '9bd38c22848a3ebca7ae8ef915cac93a2d97c57bb2cb6da7160b86ca81598a7b';

describe('new Id()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');
  it('new Id without privK', function() {
    expect(id.keyRecover).to.be.equal(key0id);
    expect(id.keyRevoke).to.be.equal(key0id);
    expect(id.keyOperational).to.be.equal(key0id);
    expect(id.relay).to.be.equal(relay);
  });
});

describe('id.createID() & id.deployID()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0id = kc.generateKeyRand();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');
  it('id.createID()', function() {
    return id.createID().then(res => {
      expect(res).to.be.equal(id.idaddr);

      return id.deployID().then(res => {
        // console.log("deployID", res.data);
        expect(res.status).to.be.equal(200);
      });
    });
  });
});

describe('id. AuthorizeKSignClaim() and ClaimDefault()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');
  return id.createID().then(res => {
    let ksign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
    let proofOfKSign = {};
    before(function() {
      return id.AuthorizeKSignClaim(kc, id.keyOperational, 'iden3.io', ksign, 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
        proofOfKSign = res.data.proofOfClaim;
        expect(res.status).to.be.equal(200);
      });
    });

    it('id.AuthorizeKSignClaim()', function() {
      expect(proofOfKSign).to.not.be.equal({});
    });

    // use the ksign that have been authorized in the AuthorizeKSignClaim
    // to sign a new ClaimDefault
    it('id.ClaimDefault()', function() {
      return id.ClaimDefault(kc, ksign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
        expect(res.status).to.be.equal(200);
      });
    });
  });
});

describe('id.vinculateID()', function() {

  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0id = kc.importKey(testPrivKHex1);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');

  before(function() {
    return id.createID().then(res => {});
  });

  // let ksign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');

  it('vinculateID()', function() {
    let name = 'username2';
    kc.unlock('pass');
    return id.vinculateID(kc, name).then(res => {
      expect(res.status).to.be.equal(200);
      // console.log("postVinculateID", res.data);
      return relay.resolveName(name + "@iden3.io").then(res => {
        // console.log("resolveName", res.data);
        expect(res.status).to.be.equal(200);
      });
    });
  });
});

describe('id localstorage test', function() {
  it('id(localstorage).createID() & vinculateID()', function() {
    let kc = new iden3.KeyContainer('localstorage');
    kc.unlock('pass');
    let ko = kc.generateKeyRand();
    let krec = kc.generateKeyRand();
    let krev = kc.generateKeyRand();
    const relay = new iden3.Relay('http://127.0.0.1:8000');
    let id = new iden3.Id(krec, krev, ko, relay, '');

    return id.createID().then(res => {
      expect(res).to.be.equal(id.idaddr);

      let name = 'usernametest';
      return id.vinculateID(kc, name).then(res => {
        expect(res.status).to.be.equal(200);
        // console.log("postVinculateID", res.data);
        return relay.resolveName(name + "@iden3.io").then(res => {
          // console.log("resolveName", res.data);
          expect(res.status).to.be.equal(200);
          expect(res.data.ethID).to.be.equal(id.idaddr);

        });
      });
    });
  });
});
