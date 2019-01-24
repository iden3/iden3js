const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const testPrivKHex1 = '9bd38c22848a3ebca7ae8ef915cac93a2d97c57bb2cb6da7160b86ca81598a7b';
const db = new iden3.Db();
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/v0.1';

describe('[id] new Id()', () => {
  let dataBase;
  let keyContainer;
  let id;
  let keys;
  let relay;
  before('Create local storage container and relay object', () => {
    dataBase = new iden3.Db();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    relay = new iden3.Relay(relayUrl);
  });

  it('Generate keys for identity', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    // Generate key master in key container
    keyContainer.generateMasterSeed(mnemonic);
    const mnemonicDb = keyContainer.getMasterSeed();
    // Check master seed from database is the same as the master seed input
    expect(mnemonic).to.be.equal(mnemonicDb);
    // Generate Key seed
    const ack = keyContainer.generateKeySeed(mnemonicDb);
    if (ack) {
      const { keySeed, pathKey } = keyContainer.getKeySeed();
      // Generate keys for first identity
      const objectKeys = keyContainer.generateKeysFromKeyPath(keySeed, pathKey);
      ({ keys } = objectKeys);
      id = new iden3.Id(keys[1], keys[2], keys[3], relay, relayAddr, '', undefined, 0);
    }
    keyContainer.lock();
  });

  it('Check identity keys', () => {
    expect(id.keyOperationalPub).to.be.equal(keys[1]);
    expect(id.keyRecover).to.be.equal(keys[2]);
    expect(id.keyRevoke).to.be.equal(keys[3]);
    expect(id.relay).to.be.equal(relay);
  });

  // Get proofOfClaim in CreateId
  it('Create identity and deploy it', async () => {
    keyContainer.unlock('pass');
    await id.createID()
      .then(async (createIDRes) => {
      // Successfull create identity api call to relay
        expect(createIDRes).to.be.equal(id.idAddr);
        await id.deployID()
          .then((deployIDres) => {
          // Successfull deploy identity api call to relay
            expect(deployIDres.status).to.be.equal(200);
          })
          .catch((error) => {
            expect(error.response.data.error).to.be.equal('already deployed');
          });
      });
    keyContainer.lock();
  });

  it('Check authorize key sign claim and generic claim', async () => {
    keyContainer.unlock('pass');
    const keyLabel = 'testKey';
    const kSign = id.createKey(keyContainer, keyLabel);
    let proofOfKSign = {};
    // Check key generated is not random
    expect(kSign).to.be.equal('0xaac4ed37a11e6a9170cb19a6e558913dc3efa6a7');

    await id.authorizeKSignClaim(keyContainer, id.keyOperationalPub, kSign)
      .then((authRes) => {
        proofOfKSign = authRes.data.proofOfClaim;
        expect(authRes.status).to.be.equal(200);

        expect(proofOfKSign).to.not.be.equal({});
        // use the kSign that have been authorized in the AuthorizeKSignClaim
        // to sign a new genericClaim
        id.genericClaim(keyContainer, kSign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then((claimDefRes) => {
          expect(claimDefRes.status).to.be.equal(200);
        });
      });
  });
}); // Final describe

// TODO
// Post claim authorizeKSign256K1 claim with operationalPub --> handle error already claim exist
// Post claim with any claim and get proofOfClaim --> check proof given by the relay is True
// Create test for each commit, as well as in Id.js
/*
describe('[id] id.bindID()', () => {
  const keyContainer = new iden3.KeyContainer('localStorage', db);
  keyContainer.unlock('pass');
  const key0id = keyContainer.importKey(testPrivKHex1);
  const relay = new iden3.Relay(relayUrl);
  const id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');

  before(() => id.KeyContainer().then((res) => {}));

  it('bindID()', () => {
    const name = 'username2';

    keyContainer.unlock('pass');
    return id.bindID(keyContainer, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
      });
    });
  });
});

describe('[id] id localstorage test', () => {
  it('id(localStorage).KeyContainer() & bindID()', () => {
    const keyContainer = new iden3.KeyContainer('localStorage', db);
    keyContainer.unlock('pass');
    const ko = keyContainer.generateKeyRand();
    const krec = keyContainer.generateKeyRand();
    const krev = keyContainer.generateKeyRand();
    const relay = new iden3.Relay(relayUrl);
    const id = new iden3.Id(krec, krev, ko, relay, relayAddr, '');

    return id.KeyContainer().then((res) => {
      expect(res).to.be.equal(id.idAddr);

      const name = 'usernametest';
      return id.bindID(keyContainer, name).then((bindRes) => {
        expect(bindRes.status).to.be.equal(200);
        // console.log('postVinculateID', res.data);
        return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
          // console.log('resolveName', res.data);
          expect(resolveRes.status).to.be.equal(200);
          expect(resolveRes.data.ethID).to.be.equal(id.idAddr);
        });
      });
    });
  });
});
*/
