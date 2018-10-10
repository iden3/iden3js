const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new Id()', function() {
  let kc = new iden3.KeyContainer('teststorage');
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
  let kc = new iden3.KeyContainer('teststorage');
  let key0id = kc.generateKey();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');
  it('id.createID()', function() {
    return id.createID().then(res => {
      // console.log("idcreateID", res);
      expect(res).to.be.equal(id.idaddr);

      return id.deployID().then(res => {
        // console.log("deployID", res.data);
        expect(res.status).to.be.equal(200);
      });
    });
  });
});

describe('id. AuthorizeKSignClaim() and ClaimDefault()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');

  let ksign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
  // let ksign = key0id;
  let proofOfKSign = {};
  before(function() {
    return id.AuthorizeKSignClaim(kc, key0id, 'iden3.io', ksign, 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
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

describe('id.vinculateID()', function() {

  let kc = new iden3.KeyContainer('teststorage');
  let key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');

  before(function() {
    return id.createID().then(res => {
    });
  });

  // let ksign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');

  it('vinculateID()', function() {
    let name = 'username2';
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
