import { testNamesJSON } from '../src/http/name-resolver';
import { testEntitiesJSON } from '../src/http/discovery';

const chai = require('chai');

const { expect } = chai;

const iden3 = require('../index');

const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const name = 'protocols-login-test-user';
const mnemonic = 'adjust toy select soon nest caught resource rally side wheat traffic amount';

const db = new iden3.Db();
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const relay = new iden3.Relay('http://127.0.0.1:8000/api/unstable');
const nameServerUrl = 'http://127.0.0.1:7000/api/unstable';
const nameServer = new iden3.NameServer(nameServerUrl);

kc.generateMasterSeed(mnemonic);
const mnemonicDb = kc.getMasterSeed();
kc.generateKeySeed(mnemonicDb);
const { keySeed, pathKey } = kc.getKeySeed();
const objectKeys = kc.generateKeysFromKeyPath(keySeed, pathKey);
const { keys } = objectKeys;
const id = new iden3.Id(keys[1], keys[2], keys[3], relay, 0);
id.addNameServer(nameServer);
const ksign = keys[1]; // public key in hex format

// vars that will be filled with http requests to the relay
let proofEthName = {};
let proofKSign = {};

describe('[protocol] login', () => {
  let signedPacketVerifier;

  before('Create idenity and bind it to a name', async () => {
    kc.unlock('pass');
    const resCreateId = await id.createId();
    proofKSign = resCreateId.proofClaim;
    const resBindId = await id.bindId(kc, id.keyOperationalPub, proofKSign, name);
    proofEthName = resBindId.data;
    const resResolveName = await nameServer.resolveName(`${name}@iden3.io`);
    expect(resResolveName.data.idAddr).to.be.equal(id.idAddr);
  });

  after('lock key container', () => {
    kc.lock();
  });

  it('initialize login objects', () => {
    const discovery = new iden3.discovery.Discovery(testEntitiesJSON);
    const nameResolver = new iden3.nameResolver.NameResolver(testNamesJSON);
    signedPacketVerifier = new iden3.protocols.login.SignedPacketVerifier(discovery, nameResolver);
  });

  it('verify ProofClaimFull (proofClaimAssignName & proofKSign)', () => {
    const ksignVerified = iden3.protocols.verifyProofClaimFull(proofKSign, relayAddr);
    expect(ksignVerified).to.be.equal(true);

    const assignNameVerified = iden3.protocols.verifyProofClaimFull(proofEthName.proofAssignName, relayAddr);
    expect(assignNameVerified).to.be.equal(true);
  });

  it('newRequestIdenAssert', () => {
    const origin = 'domain.io';
    const nonceDB = new iden3.protocols.nonceDB.NonceDB();
    const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, origin, 2 * 60);

    const date = new Date();
    const unixtime = Math.round((date).getTime() / 1000);
    const resClaim = iden3.protocols.verifyProofClaimFull(proofKSign, relayAddr);
    expect(resClaim).to.be.equal(true);

    const expirationTime = unixtime + (3600 * 60);
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, id.idAddr, proofEthName, kc, ksign, proofKSign, expirationTime);

    const resIdenAssert = signedPacketVerifier.verifySignedPacketIdenAssert(signedPacket, nonceDB, origin);
    expect(resIdenAssert).to.be.not.equal(undefined);
    // check that the nonce returned when deleting the nonce of the signedPacket, is the same
    // than the nonce of the signatureRequest
    expect(resIdenAssert.nonceObj.nonce).to.be.equal(signatureRequest.body.data.challenge);
    // nonce must not be more in the nonceDB
    expect(nonceDB.search(resIdenAssert.nonceObj.nonce)).to.be.equal(undefined);
    expect(resIdenAssert.ethName).to.be.equal(proofEthName.ethName);
    expect(resIdenAssert.idAddr).to.be.equal(id.idAddr);
  });
});
