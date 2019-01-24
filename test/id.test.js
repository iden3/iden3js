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
        expect(createIDRes.idAddr).to.be.equal(id.idAddr);

        // console.log(createIDRes.proofOfClaim);
        const util = require('util')
        // alternative shortcut
        console.log(util.inspect(createIDRes.proofOfClaim, false, null, true /* enable colors */))

        expect(createIDRes.proofOfClaim).to.be.not.equal(undefined);
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

  it('Check authorize public key sign claim', async () => {
    keyContainer.unlock('pass');
    const keyLabel = 'testKey';
    const keyToAdd = id.createKey(keyContainer, keyLabel, true);
    const keyToAdd2 = id.createKey(keyContainer, keyLabel, true);
    let proofOfKSign = {};
    // Check public key generated is not random
    expect(keyToAdd).to.be.equal('0x025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa279105');
    // Send `keyToAdd` to the Relay server
    await id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, keyToAdd)
      .then(async (authRes) => {
        proofOfKSign = authRes.data.proofOfClaim;
        expect(authRes.status).to.be.equal(200);
        expect(proofOfKSign.Leaf).to.not.be.equal('0000000000000000000000000000000000000000000000000000000000000000'
                                                + '0000000000000000000000000000000000000000000000000000000000000000'
                                                + '00025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa27'
                                                + '000000000000000000000000000000000000c81e000000000000000000000004');
        // use the kSign that have been authorized in the AuthorizeKSignClaimSecp256k1 above
        // to sign a new claim
        await id.authorizeKSignSecp256k1(keyContainer, keyToAdd, keyToAdd2)
          .then((authRes2) => {
            proofOfKSign = authRes2.data.proofOfClaim;
            expect(authRes2.status).to.be.equal(200);
            expect(proofOfKSign.Leaf).to.not.be.equal('0000000000000000000000000000000000000000000000000000000000000000'
                                                    + '0000000000000000000000000000000000000000000000000000000000000000'
                                                    + '00039e8e3c1b0a09489e96e755d56db2eee777660d92eec53b25cf1c46cedd17'
                                                    + '0000000000000000000000000000000000009105000000000000000000000004');
          })
          .catch((error) => {
            console.error(error.response.data.error);
          });
      })
      .catch((error) => {
        console.error(error.response.data.error);
      });
    keyContainer.lock();
  });

  it('Bind identity and check it on resolve name service', async () => {
    keyContainer.unlock('pass');
    const name = 'testName';
    await id.bindID(keyContainer, name)
      .then(async (bindRes) => {
        expect(bindRes.status).to.be.equal(200);
        await relay.resolveName(`${name}@iden3.io`)
          .then((resolveRes) => {
            expect(resolveRes.status).to.be.equal(200);
            expect(resolveRes.data.ethAddr).to.be.equal(id.idAddr);
          })
          .catch((error) => {
            console.error(error.message);
          });
      })
      .catch((error) => {
        console.error(error.message);
      });
    keyContainer.lock();
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
          expect(resolveRes.data.ethAddr).to.be.equal(id.idAddr);
        });
      });
    });
  });
});
