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
const ack = kc.generateKeySeed(mnemonicDb);
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
      proofOfEthName = bindRes.data;
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
      });
    });
  });

  it('verify ProofClaimFull (proofOfClaimAssignName & proofOfKSign)', () => {
    const assignNameVerified = iden3.protocols.verifyProofClaimFull(proofOfEthName.proofOfClaimAssignName, relayAddr);
    expect(assignNameVerified).to.be.equal(true);

    const ksignVerified = iden3.protocols.verifyProofClaimFull(proofOfKSign, relayAddr);
    expect(ksignVerified).to.be.equal(true);
  });

  it('newRequestIdenAssert', () => {
    const origin = 'domain.io';
    const nonceDB = new iden3.protocols.NonceDB();
    const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, origin, 2 * 60);

    const date = new Date();
    const unixtime = Math.round((date).getTime() / 1000);
    const res = iden3.protocols.verifyProofClaimFull(proofOfKSign, relayAddr);
    expect(res).to.be.equal(true);

    const expirationTime = unixtime + (3600 * 60);
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, id.idAddr, `${name}@iden3.io`, proofOfEthName, kc, ksign, proofOfKSign, expirationTime);

    const nonce = iden3.protocols.login.verifySignedPacket(nonceDB, origin, signedPacket);
    expect(nonce).to.be.not.equal(undefined);

    // check that the nonce returned when deleting the nonce of the signedPacket, is the same
    // than the nonce of the signatureRequest
    expect(nonce.nonce).to.be.equal(signatureRequest.body.data.challenge);

    // nonce must not be more in the nonceDB
    expect(nonceDB.search(nonce.nonce)).to.be.equal(undefined);
  });
});
