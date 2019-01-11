
const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;
const testPrivKHex = '9bd38c22848a3ebca7ae8ef915cac93a2d97c57bb2cb6da7160b86ca81598a7b';
const db = new iden3.Db();
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const key0id = kc.importKey(testPrivKHex);
const relay = new iden3.Relay('http://127.0.0.1:8000');
const id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');

before(() => id.createID().then((res) => {}));

describe('[id] id.bindID()', () => {

  it('bindID()', () => {
    const name = 'username1';

    kc.unlock('pass');
    return id.bindID(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
	expect(resolveRes.data.ethID).to.be.equal(id.idAddr);
      });
    });
  });
});
describe('[id] id.bindID() 2nd', () => {

  it('bindID()', () => {
    const name = 'username2';

    kc.unlock('pass');
    return id.bindID(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
	expect(resolveRes.data.ethID).to.be.equal(id.idAddr);
      });
    });
  });
});
