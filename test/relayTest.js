const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');
const ethUtil = require('ethereumjs-util');

const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
// const testPrivKHex = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';
const testPrivK = Buffer.from(testPrivKHex.replace('0x', ''), 'hex');
const idaddr = ethUtil.privateToAddress(testPrivK);
const idaddrHex = iden3.utils.bytesToHex(idaddr);

const relay = new iden3.Relay('http://127.0.0.1:8000');

describe('getRelayRoot()', function() {
  it('getRelayRoot()', function() {
    return relay.getRelayRoot().then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});
describe('getIDRoot()', function() {
  it('getIDRoot()', function() {
    return relay.getIDRoot(idaddrHex).then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});

describe('relay.createID()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  // let key0id = kc.importKey('289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032');
  let key0id = kc.generateKeyRand();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  it('relay.createID() & relay.getID()', function() {
    return relay.createID(key0id, key0id, key0id).then(res => {
      // console.log("relay.createID", res.data);
      expect(res.status).to.be.equal(200);

      return relay.getID(res.data.idaddr).then(res => {
        // console.log("relay.getID", res.data);
        expect(res.status).to.be.equal(200);
      });
    });
  });
});

describe('postVinculateID()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  // let key0id = kc.importKey(testPrivKHex);
  let key0id = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');

  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(key0id, key0id, key0id, relay, '');

  before(function() {
    return id.createID().then(res => {});
  });

  it('postVinculateID()', function() {
    let name = 'johndoe';
    let idBytes = iden3.utils.hexToBytes(id.idaddr);
    let nameBytes = Buffer.from(name);

    let msgBytes = new Buffer([]);
    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    kc.unlock('pass');
    let signatureObj = kc.sign(key0id, iden3.utils.bytesToHex(msgBytes));
    let vinculateIDMsg = {
      ethID: id.idaddr,
      name: name,
      signature: signatureObj.signature
    };
    return relay.postVinculateID(vinculateIDMsg).then(res => {
      expect(res.status).to.be.equal(200);
      // console.log("postVinculateID", res.data);
      return relay.resolveName(name + "@iden3.io").then(res => {
        // console.log("resolveName", res.data);
        expect(res.status).to.be.equal(200);
      });
    });
  });
});
