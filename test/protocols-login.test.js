const chai = require('chai');

const { expect } = chai;

const iden3 = require('../index');

const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const name = 'usertest';
const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';

const db = new iden3.Db();
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const relay = new iden3.Relay('http://127.0.0.1:8000/api/unstable');

kc.generateMasterSeed(mnemonic);
const mnemonicDb = kc.getMasterSeed();
const ack = kc.generateKeySeed(mnemonicDb);
const { keySeed, pathKey } = kc.getKeySeed();
const objectKeys = kc.generateKeysFromKeyPath(keySeed, pathKey);
let keys;
({ keys } = objectKeys);
let id = new iden3.Id(keys[1], keys[2], keys[3], relay, relayAddr, '', undefined, 0);
const ksign = keys[1]; // public key in hex format

// vars that will be filled with http requests to the relay
let proofEthName = {};
let proofKSign = {};

describe('[protocol] login', () => {
  before(() => id.createId().then((res) => {
    proofKSign = res.proofClaim;
  }));
  before(() => {
    return id.bindId(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      proofEthName = bindRes.data;
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
      });
    });
  });

  it('verify ProofClaimFull (proofClaimAssignName & proofKSign)', () => {
    const assignNameVerified = iden3.protocols.verifyProofClaimFull(proofEthName.proofClaimAssignName, relayAddr);
    expect(assignNameVerified).to.be.equal(true);

    const ksignVerified = iden3.protocols.verifyProofClaimFull(proofKSign, relayAddr);
    expect(ksignVerified).to.be.equal(true);
  });

  it('newRequestIdenAssert', () => {
    const origin = 'domain.io';
    const nonceDB = new iden3.protocols.nonceDB.NonceDB();
    const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, origin, 2 * 60);

    const date = new Date();
    const unixtime = Math.round((date).getTime() / 1000);
    const res = iden3.protocols.verifyProofClaimFull(proofKSign, relayAddr);
    expect(res).to.be.equal(true);

    const expirationTime = unixtime + (3600 * 60);
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, id.idAddr, `${name}@iden3.io`, proofEthName.proofClaimAssignName, kc, ksign, proofKSign, expirationTime);

    const nonce = iden3.protocols.login.verifySignedPacket(nonceDB, origin, signedPacket);
    expect(nonce).to.be.not.equal(undefined);

    // check that the nonce returned when deleting the nonce of the signedPacket, is the same
    // than the nonce of the signatureRequest
    expect(nonce.nonce.nonce).to.be.equal(signatureRequest.body.data.challenge);

    // nonce must not be more in the nonceDB
    expect(nonceDB.search(nonce.nonce)).to.be.equal(undefined);
  });
});
