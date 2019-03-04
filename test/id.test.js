import { AuthorizeKSignSecp256k1 } from '../src/claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1';

const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const nameServerUrl = 'http://127.0.0.1:7000/api/unstable';

describe('[id] new Id()', () => {
  let dataBase;
  let keyContainer;
  let id;
  let keys;
  let relay;
  let nameServer;
  let proofClaimKeyOperational;

  before('Create local storage container and relay object', () => {
    dataBase = new iden3.Db();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    relay = new iden3.Relay(relayUrl);
    nameServer = new iden3.NameServer(nameServerUrl);
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
      id = new iden3.Id(keys[1], keys[2], keys[3], relay, relayAddr, nameServer, '', undefined, 0);
    }
    keyContainer.lock();
  });

  it('Check identity keys', () => {
    expect(id.keyOperationalPub).to.be.equal(keys[1]);
    expect(id.keyRecover).to.be.equal(keys[2]);
    expect(id.keyRevoke).to.be.equal(keys[3]);
    expect(id.relay).to.be.equal(relay);
  });

  // Get proofClaim in CreateId
  it('Create identity and deploy it', async () => {
    keyContainer.unlock('pass');
    await id.createId()
      .then(async (createIdRes) => {
      // Successfull create identity api call to relay
        expect(createIdRes.idAddr).to.be.equal(id.idAddr);
        expect(createIdRes.idAddr).to.be.not.equal(undefined);
        expect(createIdRes.proofClaim).to.be.not.equal(undefined);
        proofClaimKeyOperational = createIdRes.proofClaim;
        await id.deployId()
          .then((deployIdres) => {
          // Successfull deploy identity api call to relay
            expect(deployIdres.status).to.be.equal(200);
          })
          .catch((error) => {
            // expect(error.response.data.error).to.be.equal('already deployed');
            console.error(error.response.data.error);
          });
      });
    keyContainer.lock();
  });
  it('relay.getId()', async () => {
    await relay.getId(id.idAddr).then((getIdres) => {
      expect(getIdres.status).to.be.equal(200);
    });
  });

  it('Check authorize public key sign claim', async () => {
    keyContainer.unlock('pass');
    const keyLabel = 'testKey';
    const keyToAdd = id.createKey(keyContainer, keyLabel, true);
    const keyToAdd2 = id.createKey(keyContainer, keyLabel, true);
    let proofKSign = {};
    // Check public key generated is not random
    expect(keyToAdd).to.be.equal('0x025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa279105');
    // Send `keyToAdd` to the Relay server
    await id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, keyToAdd)
      .then(async (authRes) => {
        proofKSign = authRes.data.proofClaim;
        expect(authRes.status).to.be.equal(200);
        expect(proofKSign.leaf).to.not.be.equal('0000000000000000000000000000000000000000000000000000000000000000'
                                                + '0000000000000000000000000000000000000000000000000000000000000000'
                                                + '00025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa27'
                                                + '000000000000000000000000000000000000c81e000000000000000000000004');
        // use the kSign that have been authorized in the AuthorizeKSignClaimSecp256k1 above
        // to sign a new claim
        await id.authorizeKSignSecp256k1(keyContainer, keyToAdd, keyToAdd2)
          .then((authRes2) => {
            proofKSign = authRes2.data.proofClaim;
            expect(authRes2.status).to.be.equal(200);
            expect(proofKSign.leaf).to.not.be.equal('0000000000000000000000000000000000000000000000000000000000000000'
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
    await id.bindId(keyContainer, id.keyOperationalPub, proofClaimKeyOperational, name)
      .then(async (bindRes) => {
        expect(bindRes.status).to.be.equal(200);
        await nameServer.resolveName(`${name}@iden3.io`)
          .then((resolveRes) => {
            expect(resolveRes.status).to.be.equal(200);
            expect(resolveRes.data.idAddr).to.be.equal(id.idAddr);
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

  it('Check request claim proof by its index request', async () => {
    keyContainer.unlock('pass');
    // Create claim and gets it index
    const authorizeKSignClaim = AuthorizeKSignSecp256k1.new(0, id.keyOperationalPub);
    const hi = (authorizeKSignClaim.toEntry()).hi();
    await relay.getClaimByHi(id.idAddr, iden3.utils.bytesToHex(hi))
      .then((res) => {
        // Check leaf claim requested is the same as the claim generated when the identty is created
        expect(res.data.proofClaim.leaf).to.be.equal(proofClaimKeyOperational.leaf);
      })
      .catch((error) => {
        console.error(error.message);
      });
    keyContainer.lock();
  });
});
