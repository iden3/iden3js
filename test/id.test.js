const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;
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
    dataBase = new iden3.Db.LocalStorage('iddbtest');
    keyContainer = new iden3.KeyContainer(dataBase);
    relay = new iden3.Relay(relayUrl);
    nameServer = new iden3.NameServer(nameServerUrl);
  });

  it('Generate keys for identity', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    // Generate key master in key container
    keyContainer.setMasterSeed(mnemonic);
    const mnemonicDb = keyContainer.getMasterSeed();
    // Check master seed from database is the same as the master seed input
    expect(mnemonic).to.be.equal(mnemonicDb);
    // Generate Key seed
    keys = keyContainer.createKeys();
    id = new iden3.Id(keys.kOp, keys.kDis, keys.kReen, relay, 0);
    keyContainer.lock();
  });

  it('Load servers', () => {
    id.addNameServer(nameServer);
    expect(id.nameServer).to.be.not.equal(undefined);
  });

  it('Check identity keys', () => {
    expect(id.keyOperationalPub).to.be.equal(keys.kOp);
    expect(id.keyDisablePub).to.be.equal(keys.kDis);
    expect(id.keyReenablePub).to.be.equal(keys.kReen);
    expect(id.relay).to.be.equal(relay);
  });

  // Get proofClaim in CreateId
  it('Create identity and deploy it', async () => {
    keyContainer.unlock('pass');
    const createIdRes = await id.createId();
    // Successfull create identity api call to relay
    expect(createIdRes.id).to.be.equal(id.id);
    expect(createIdRes.id).to.be.not.equal(undefined);
    expect(createIdRes.proofClaim).to.be.not.equal(undefined);
    proofClaimKeyOperational = createIdRes.proofClaim;
    

    // TODO for the moment the babyjub pubK expected in go and in js are different (compression)
    // const idCalculated = iden3.idUtils.calculateIdGenesis(id.keyOperationalPub, id.keyDisable, id.keyReenable);
    // expect(id.id).to.be.equal(idCalculated); 
  
    // TODO: Update when the counterfactual is updated with the Genesis ID
    // try {
    //   const deployIdres = await id.deployId();
    //   // Successfull deploy identity api call to relay
    //   expect(deployIdres.status).to.be.equal(200);
    // } catch (e) {
    //   // Deploying may fail because the identity has already been depoloyed.
    //   expect(e.response.status).to.be.equal(400);
    //   expect(e.response.data.error).to.be.equal('error deploying');
    //   console.error(e);
    // }
    keyContainer.lock();
  });
  // TODO: Update when the counterfactual is updated with the Genesis ID
  // it('relay.getId()', async () => {
  //   const getIdres = await relay.getId(id.id);
  //   expect(getIdres.status).to.be.equal(200);
  // });

  // TODO: Update when creation of new baby jub keys is needed
  // it('Check authorize public key sign claim', async () => {
  //   keyContainer.unlock('pass');
  //   const keyLabel = 'testKey';
  //   const keyToAdd = id.createKey(keyContainer, keyLabel, true);
  //   const keyToAdd2 = id.createKey(keyContainer, keyLabel, true);
  //   let proofKSign = {};
  //   // Check public key generated is not random
  //   expect(keyToAdd).to.be.equal('0x025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa279105');
  //   // Send `keyToAdd` to the Relay server
  //   const authRes = await id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, keyToAdd);
  //   proofKSign = authRes.data.proofClaim;
  //   expect(authRes.status).to.be.equal(200);
  //   expect(proofKSign.leaf).to.not.be.equal(''
  //     + '0000000000000000000000000000000000000000000000000000000000000000'
  //     + '0000000000000000000000000000000000000000000000000000000000000000'
  //     + '00025521b25f396b1f62fcc46ce5b9a6b53684d5649958d83d79b5bb6711aa27'
  //     + '000000000000000000000000000000000000c81e000000000000000000000004');
  //   // use the kSign that have been authorized in the AuthorizeKSignClaimSecp256k1 above
  //   // to sign a new claim
  //   const authRes2 = await id.authorizeKSignSecp256k1(keyContainer, keyToAdd, keyToAdd2);
  //   proofKSign = authRes2.data.proofClaim;
  //   expect(authRes2.status).to.be.equal(200);
  //   expect(proofKSign.leaf).to.not.be.equal(''
  //     + '0000000000000000000000000000000000000000000000000000000000000000'
  //     + '0000000000000000000000000000000000000000000000000000000000000000'
  //     + '00039e8e3c1b0a09489e96e755d56db2eee777660d92eec53b25cf1c46cedd17'
  //     + '0000000000000000000000000000000000009105000000000000000000000004');
  //   keyContainer.lock();
  // });

  it('Bind identity and check it on resolve name service', async () => {
    keyContainer.unlock('pass');
    const name = 'testName';
    const bindRes = await id.bindId(keyContainer, id.keyOperationalPub, proofClaimKeyOperational, name);
    expect(bindRes.status).to.be.equal(200);
    const resolveRes = await nameServer.resolveName(`${name}@iden3.eth`);
    expect(resolveRes.status).to.be.equal(200);
    expect(resolveRes.data.id).to.be.equal(id.id);
    keyContainer.lock();
  });

  // TODO: Update when new authorize ksign constructor (that thakes compresed pk) is merged
  // it('Check request claim proof by its index request', async () => {
  //   keyContainer.unlock('pass');
  //   // Create claim and gets it index
  //   // const authorizeKSignClaim = AuthorizeKSignSecp256k1.new(0, id.keyOperationalPub);
  //   const authorizeKSignClaim = iden3.claim.AuthorizeKSignSecp256k1.new(0, id.keyOperationalPub);
  //   const hi = (authorizeKSignClaim.toEntry()).hi();
  //   const res = await relay.getClaimByHi(id.id, iden3.utils.bytesToHex(hi));
  //   // Check leaf claim requested is the same as the claim generated when the identty is created
  //   expect(res.data.proofClaim.leaf).to.be.equal(proofClaimKeyOperational.leaf);
  //   keyContainer.lock();
  // });
});
