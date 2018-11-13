const chai = require('chai');
const iden3 = require('../index');

const {expect} = chai;
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const testPrivKHex1 = '9bd38c22848a3ebca7ae8ef915cac93a2d97c57bb2cb6da7160b86ca81598a7b';
const db = new iden3.Db();

describe('new Id()', () => {
  const kc = new iden3.KeyContainer('localStorage', db);
  kc.unlock('pass');
  const key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  const id = new iden3.Id(key0id, key0id, key0id, relay, '');

  it('new Id without privK', () => {
    expect(id.keyRecover).to.be.equal(key0id);
    expect(id.keyRevoke).to.be.equal(key0id);
    expect(id.keyOperational).to.be.equal(key0id);
    expect(id.relay).to.be.equal(relay);
  });
});

describe('id.createID() & id.deployID()', () => {
  const kc = new iden3.KeyContainer('localStorage', db);
  kc.unlock('pass');
  const key0id = kc.generateKeyRand();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  const id = new iden3.Id(key0id, key0id, key0id, relay, '');

  it('id.createID()', () => id.createID().then((ceateIDRes) => {
    expect(ceateIDRes).to.be.equal(id.idaddr);

    return id.deployID().then((deployIDres) => {
      expect(deployIDres.status).to.be.equal(200);
    });
  }));
});

describe('id. AuthorizeKSignClaim() and GenericClaim()', () => {
  const kc = new iden3.KeyContainer('localStorage', db);
  kc.unlock('pass');
  const key0id = kc.importKey(testPrivKHex);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  const id = new iden3.Id(key0id, key0id, key0id, relay, '');

  return id.createID().then((res) => {
    const kSign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
    let proofOfKSign = {};

    before(() => id.authorizeKSignClaim(kc, id.keyOperational, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
      proofOfKSign = authRes.data.proofOfClaim;
      expect(authRes.status).to.be.equal(200);
    }));

    it('id.AuthorizeKSignClaim()', () => {
      expect(proofOfKSign).to.not.be.equal({});
    });

    // use the kSign that have been authorized in the AuthorizeKSignClaim
    // to sign a new genericClaim
    it('id.genericClaim()', () => id.genericClaim(kc, kSign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then((claimDefRes) => {
      expect(claimDefRes.status).to.be.equal(200);
    }));
  });
});

describe('id.bindID()', () => {
  const kc = new iden3.KeyContainer('localStorage', db);
  kc.unlock('pass');
  const key0id = kc.importKey(testPrivKHex1);
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  const id = new iden3.Id(key0id, key0id, key0id, relay, '');

  before(() => id.createID().then((res) => {}));

  it('bindID()', () => {
    const name = 'username2';

    kc.unlock('pass');
    return id.bindID(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
      });
    });
  });
});

describe('id localstorage test', () => {
  it('id(localStorage).createID() & bindID()', () => {
    const kc = new iden3.KeyContainer('localStorage', db);
    kc.unlock('pass');
    const ko = kc.generateKeyRand();
    const krec = kc.generateKeyRand();
    const krev = kc.generateKeyRand();
    const relay = new iden3.Relay('http://127.0.0.1:8000');
    const id = new iden3.Id(krec, krev, ko, relay, '');

    return id.createID().then((res) => {
      expect(res).to.be.equal(id.idaddr);

      const name = 'usernametest';
      return id.bindID(kc, name).then((bindRes) => {
        expect(bindRes.status).to.be.equal(200);
        // console.log('postVinculateID', res.data);
        return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
          // console.log('resolveName', res.data);
          expect(resolveRes.status).to.be.equal(200);
          expect(resolveRes.data.ethID).to.be.equal(id.idaddr);
        });
      });
    });
  });
});
