const chai = require('chai');
const ethUtil = require('ethereumjs-util');
const CONSTANTS = require('../src/constants');
const iden3 = require('../index');

const { expect } = chai;

const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
// const testPrivKHex = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';
const testPrivK = Buffer.from(testPrivKHex.replace('0x', ''), 'hex');
const idaddr = ethUtil.privateToAddress(testPrivK);
const idaddrHex = iden3.utils.bytesToHex(idaddr);
const relay = new iden3.Relay('http://127.0.0.1:8000');

describe('getRelayRoot()', () => {
  it('getRelayRoot()', () => relay.getRelayRoot()
    .then((res) => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    }));
});

describe('getIDRoot()', () => {
  it('getIDRoot()', () => relay.getIDRoot(idaddrHex)
    .then((res) => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    }));
});

describe('relay.createID()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  // let key0id = kc.importKey('289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032');
  const key0id = kc.generateKeyRand();
  const _relay = new iden3.Relay('http://127.0.0.1:8000');

  it('relay.createID() & relay.getID()', () => _relay.createID(key0id, key0id, key0id)
    .then((createIDRes) => {
      // console.log("relay.createID", createIDRes.data);
      expect(createIDRes.status).to.be.equal(200);

      return _relay.getID(createIDRes.data.idaddr)
        .then((getIDres) => {
          // console.log("relay.getID", getIDres.data);
          expect(getIDres.status).to.be.equal(200);
        });
    }));
});

describe('postBindID()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  // let key0id = kc.importKey(testPrivKHex);
  const key0id = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
  const _relay = new iden3.Relay('http://127.0.0.1:8000');
  const id = new iden3.Id(key0id, key0id, key0id, _relay, '');

  before(() => id.createID().then((res) => {}));

  it('postVinculateID()', () => {
    const name = 'johndoe';
    const idBytes = iden3.utils.hexToBytes(id.idaddr);
    const nameBytes = Buffer.from(name);

    let msgBytes = Buffer.from([]);
    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    kc.unlock('pass');
    const signatureObj = kc.sign(key0id, iden3.utils.bytesToHex(msgBytes));
    const bindIDMsg = {
      ethID: id.idaddr,
      name,
      signature: signatureObj.signature,
    };
    return _relay.postBindID(bindIDMsg)
      .then((bindIDRes) => {
        expect(bindIDRes.status).to.be.equal(200);
        // console.log("postBindID", bindIDRes.data);
        return _relay.resolveName(`${name}@iden3.io`)
          .then((resolveRes) => {
            // console.log("resolveName", resolveRes.data);
            expect(resolveRes.status).to.be.equal(200);
          });
      });
  });
});
