const snarkjs = require('snarkjs');
const chai = require('chai');
const iden3 = require('../index');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const utils = require('../utils');
const Entry = require('../claim/entry/entry');

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
      //Leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052dc5fa952194ad6c3268666fc4e64407a1d457a0032716d1c027e456988fd6c380442cfadc8bfa8c1e08f8037f83121c82a8a59000000000000000000000000000000000000000000000000f60d928459d792ed',
      //Proof: '0x00090000000000000000000000000000000000000000000000000000000001001b29c7931e5676445c88c2e495cb346ed6d295ab997d796810019025bb255b67',
      //Root: '0x2a9ec33a4de8806b624abbc9e1fac423602512797fd55228c3ef0ac7b9a08631'
      Leaf: "0x"
		+"0000000000000000000000000000000000000000000000000000000000000000"
		+"000000000000000000000000393939393939393939393939393939393939393a"
		+"00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a"
		+"0000000000000000000000000000000000000000000000010000000000000003",
      Proof: "0x"
		+"000600000000000000000000000000000000000000000000000000000000002f"
		+"096c4844ff1a371253894c44bbc7b79915ba5a08868a19cdd4ff669ba5bf4d67"
		+"0ce08b5f71063762286214277d6d46ee0ecc1430f214daf597966c71f681ada2"
		+"25ae1d27a7d498d5eded2d259bac59899ea063135e91d989f5a163425de75dd2"
		+"0cf77fa54111c30805962fb39fad88302d250dca1de63c71dd3a95ba5c11450e"
		+"20696d87aeec38c4fb986bdfb6bed824173370cfd75cb4a8e907900278054d68",
      Root: "0x143ff097f932cd5f9964323cd1225cc26f2265a4b68b29e539f70af0902b204b"
    },
    ClaimNonRevocationProof: {
      //Leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052dc5fa952194ad6c3268666fc4e64407a1d457a0032716d1c027e456988fd6c380442cfadc8bfa8c1e08f8037f83121c82a8a59000000000000000000000000000000000000000000000001f60d928459d792ed',
      //Proof: '0x01020000000000000000000000000000000000000000000000000000000000022d6ffc14a04948b406df7ec6019689c7d2fc2b22e2ded6aea9c2a81f08d3a598',
      //Root: '0x2a9ec33a4de8806b624abbc9e1fac423602512797fd55228c3ef0ac7b9a08631'
      Leaf: "0x"
		+"0000000000000000000000000000000000000000000000000000000000000000"
		+"000000000000000000000000393939393939393939393939393939393939393a"
		+"00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a"
		+"0000000000000000000000000000000000000000000000020000000000000003",
      Proof: "0x"
		+"0303000000000000000000000000000000000000000000000000000000000007"
		+"0199514547ca38a4f861610d6ec78fdb6a64b52999050d97767bf204cbb5c009"
		+"122604e40fa2503807e72b934ffa449ad3dc3ef9f635e43d212f910fab02ef5a"
		+"198f58142bf335b3b7ef32407e644f6b6bee408efd10d0e7826cf16f98fd6597"
		+"1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed"
		+"1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed",
      Root: "0x143ff097f932cd5f9964323cd1225cc26f2265a4b68b29e539f70af0902b204b"
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

  it('test check proof', () => {
    const leaf = "0x"
		+"0000000000000000000000000000000000000000000000000000000000000000"
		+"000000000000000000000000393939393939393939393939393939393939393a"
		+"00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a"
		+"0000000000000000000000000000000000000000000000010000000000000003";
    const proof = "0x"
		+"000600000000000000000000000000000000000000000000000000000000002f"
		+"096c4844ff1a371253894c44bbc7b79915ba5a08868a19cdd4ff669ba5bf4d67"
		+"0ce08b5f71063762286214277d6d46ee0ecc1430f214daf597966c71f681ada2"
		+"25ae1d27a7d498d5eded2d259bac59899ea063135e91d989f5a163425de75dd2"
		+"0cf77fa54111c30805962fb39fad88302d250dca1de63c71dd3a95ba5c11450e"
		+"20696d87aeec38c4fb986bdfb6bed824173370cfd75cb4a8e907900278054d68";
    const root = "0x143ff097f932cd5f9964323cd1225cc26f2265a4b68b29e539f70af0902b204b";

    let entry = new Entry();
    entry.fromHexadecimal(leaf);
    const res = smt.checkProof(root, proof, utils.bytesToHex(entry.hi()), utils.bytesToHex(entry.hv()));
    expect(res).to.be.equal(true);
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
