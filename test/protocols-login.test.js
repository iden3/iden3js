const chai = require('chai');

const { expect } = chai;

const iden3 = require('../index');

const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const name = 'usertest';
const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';

const db = new iden3.Db();
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const relay = new iden3.Relay('http://127.0.0.1:8000/api/v0.1');

kc.generateMasterSeed(mnemonic);
const mnemonicDb = kc.getMasterSeed();
const { keySeed, pathKey } = kc.getKeySeed();
const objectKeys = kc.generateKeysFromKeyPath(keySeed, pathKey);
({ keys } = objectKeys);
let id = new iden3.Id(keys[1], keys[2], keys[3], relay, relayAddr, '', undefined, 0);
const ksign = keys[0];

// vars that will be filled with http requests to the relay
let proofOfEthName = {};
let proofOfKSign = {};

describe('[protocol] login', () => {
  before(() => id.createID().then((res) => {
    proofOfKSign = res.proofOfClaim;
  }));
  before(() => {
    return id.bindID(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
        proofOfEthName = resolveRes.data;
      });
    });
  });

  it('verify ProofClaimFull (proofOfClaimAssignName & proofOfKSign)', () => {
    const assignNameVerified = iden3.protocols.login.verifyProofClaimFull(proofOfEthName.proofOfClaimAssignName, relayAddr);
    expect(assignNameVerified).to.be.equal(true);

    const ksignVerified = iden3.protocols.login.verifyProofClaimFull(proofOfKSign, relayAddr);
    expect(ksignVerified).to.be.equal(true);
  });

  it('newRequestIdenAssert', () => {
    const date = new Date();
    const unixtime = Math.round((date).getTime() / 1000);
    const minutes = 20; // will be setted in global consts or in a config file
    const timeout = unixtime + (minutes * 60);

    const signatureRequest = iden3.protocols.login.newRequestIdenAssert('0xorigin', 'session01', timeout);

    const res = iden3.protocols.login.verifyProofClaimFull(proofOfKSign, relayAddr);
    expect(res).to.be.equal(true);

    const expirationTime = unixtime + (3600 * 60);
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, id.idAddr, `${name}@iden3.io`, kc, ksign, proofOfKSign, proofOfEthName, expirationTime);

    const verified = iden3.protocols.login.verifySignedPacket(signedPacket);
    expect(verified).to.be.equal(true);
  });
});
