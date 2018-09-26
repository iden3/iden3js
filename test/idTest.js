const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new Id()', function() {
  let kc = new iden3.KeyContainer('teststorage');
  let key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:5000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');
  it('new Id without privK', function() {
    expect(id.keyRecover).to.be.equal(key0id);
    expect(id.keyRevoke).to.be.equal(key0id);
    expect(id.keyOp).to.be.equal(key0id);
    expect(id.relay).to.be.equal(relay);
  });
});

describe('id.ClaimDefault()', function() {
  it('id.ClaimDefault()', function() {
    let kc = new iden3.KeyContainer('teststorage');
    let key0id = kc.importKey(testPrivKHex);
    const relay = new iden3.Relay('http://127.0.0.1:5000');
    let id = new iden3.Id(key0id, key0id, key0id, relay, '');

    // let key1 = kc.generateKey();
    let key1 = key0id;
    return id.ClaimDefault(kc, key0id, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});

describe('id.AuthorizeKSignClaim()', function() {
  it('id.AuthorizeKSignClaim()', function() {
    let kc = new iden3.KeyContainer('teststorage');
    let key0id = kc.importKey(testPrivKHex);
    const relay = new iden3.Relay('http://127.0.0.1:5000');
    let id = new iden3.Id(key0id, key0id, key0id, relay, '');

    // let key1 = kc.generateKey();
    let key1 = key0id;
    return id.AuthorizeKSignClaim(kc, key0id, 'iden3.io', key1, 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});
