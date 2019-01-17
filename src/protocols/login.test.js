const snarkjs = require('snarkjs');
const chai = require('chai');
const iden3 = require('../index');

//const bigInt = require('big-integer');
const bigInt = snarkjs.bigInt;
const {expect} = chai;

const db = new iden3.Db();
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const ksign = kc.importKey(testPrivKHex);
const relay = new iden3.Relay('http://127.0.0.1:8000');
const id = new iden3.Id(ksign, ksign, ksign, relay, relayAddr, '');

const idAddr = '0x52dc5fa952194ad6c3268666fc4e64407a1d457a';
const ethName = 'usertest@iden3.io';
const proofOfEthName = {
  claim: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052dc5fa952194ad6c3268666fc4e64407a1d457a0032716d1c027e456988fd6c380442cfadc8bfa8c1e08f8037f83121c82a8a59000000000000000000000000000000000000000000000000f60d928459d792ed',
  ethID: '0x52dc5fa952194ad6c3268666fc4e64407a1d457a',
  proofOfClaimAssignName: {
    ClaimProof: {
      Leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052dc5fa952194ad6c3268666fc4e64407a1d457a0032716d1c027e456988fd6c380442cfadc8bfa8c1e08f8037f83121c82a8a59000000000000000000000000000000000000000000000000f60d928459d792ed',
      Proof: '0x00090000000000000000000000000000000000000000000000000000000001001b29c7931e5676445c88c2e495cb346ed6d295ab997d796810019025bb255b67',
      Root: '0x2a9ec33a4de8806b624abbc9e1fac423602512797fd55228c3ef0ac7b9a08631'
    },
    ClaimNonRevocationProof: {
      Leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052dc5fa952194ad6c3268666fc4e64407a1d457a0032716d1c027e456988fd6c380442cfadc8bfa8c1e08f8037f83121c82a8a59000000000000000000000000000000000000000000000001f60d928459d792ed',
      Proof: '0x01020000000000000000000000000000000000000000000000000000000000022d6ffc14a04948b406df7ec6019689c7d2fc2b22e2ded6aea9c2a81f08d3a598',
      Root: '0x2a9ec33a4de8806b624abbc9e1fac423602512797fd55228c3ef0ac7b9a08631'
    },
    Date: 1547541848,
    Signature: '0x741808fdf85b1a8e81d6068042b863b27ead51db0d8ff04f1a75b913daa58d874f155457f7cd33b40b77ef36e6e5cf97485046f689ff75b8fb163831802eb05e00'
  }
};

// TODO get proofOfKSign and hardwrite it in the proofOfKSign const for the tests
const proofOfKSign = {};

describe('[protocol] login', () => {

  // the next 'before' functions are to get the hardcoded const data used in this test
  /*
  before(() => id.createID().then((res) => {
    console.log("idaddr", res.data);
  }));
  before(() => {
    const name = 'usertest';
    return id.bindID(kc, name).then((bindRes) => {
      expect(bindRes.status).to.be.equal(200);
      console.log("bindRes.data", bindRes.data);
      return relay.resolveName(`${name}@iden3.io`).then((resolveRes) => {
        expect(resolveRes.status).to.be.equal(200);
        console.log("proofOfEthName", resolveRes.data);
      });
    });
  });
  // TODO finish the get proofOfKSign
  before(() => relay.getClaimByHi().then((res) => {
    console.log("proofOfKSign", res.data);
  }));
	*/
  it('test bigint', () => {
    bigInt(8).toString();
    bigInt(8).shiftLeft(2);
  });

  it('verify ProofClaimFull', () => {
    const p = proofOfEthName;
    const pa = p.proofOfClaimAssignName;
    const proofs = [
      new iden3.protocols.login.MtpProof(pa.ClaimProof.Proof, pa.ClaimNonRevocationProof.Proof, pa.ClaimProof.Root, null)
    ];
    const proof = new iden3.protocols.login.ProofClaimFull(
                                           pa.Signature,
                                           pa.ClaimProof.Leaf,
                                           proofs
    );
    const res = iden3.protocols.login.verifyProofClaimFull(proof);
    expect(res).to.be.equal(true);
  });

  //it('newRequestIdenAssert', () => {
  //  const date = new Date();
  //  const unixtime = Math.round((date).getTime() / 1000);
  //  const minutes = 20; // will be setted in global consts or in a config file
  //  const timeout = unixtime + (minutes * 60);

  //  const signatureRequest = iden3.protocols.login.newRequestIdenAssert('0xorigin', 'session01', timeout);
  //  console.log("signatureRequest:\n", signatureRequest);

  //  const expirationTime = unixtime + (3600 * 60);
  //  console.log(idAddr);
  //  const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, idAddr, ethName, kc, ksign, proofOfKSign, proofOfEthName, expirationTime);
  //  console.log("signedPacket:\n", signedPacket);

  //  const verified = iden3.protocols.login.verifySignedPacket(signedPacket);
  //  expect(verified).to.be.equal(true);
  //});
});
