const snarkjs = require('snarkjs');
const chai = require('chai');
const iden3 = require('../index');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const Entry = require('../claim/entry/entry');

const bigInt = snarkjs.bigInt;
const { expect } = chai;

const db = new iden3.Db();
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const ksign = kc.importKey(testPrivKHex);

const usrAddr = '0x52dc5fa952194ad6c3268666fc4e64407a1d457a';
const ethName = 'usertest@iden3.io';

const proofOfEthName = {
  claimAssignName: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
  ethAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
  name: 'testName',
  proofOfClaimAssignName: {
    date: 1548347303,
    leaf: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
    proofs: [
      {
        aux: null,
        mtp0: '0001000000000000000000000000000000000000000000000000000000000001083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f8199',
        mtp1: '03010000000000000000000000000000000000000000000000000000000000010fef40cc16896de64be5a0f827799555344fd3d9aade9b65d95ecfbcac3e5a73182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
        root: '1b6feefde6e76c1e9d98d30fa0993a7a7b35f5b2580a757c9a57ee383dc50b96'
      }
    ],
    signature: '4e0c47fe90f3438df2ed520101b214ce3f0088dafec479c997d970097119d8ba10493cf247c428b5819c8c025b9c3f5501d9e15a1f036ea54ed09ae0a754fb9700'
  }
};

const proofOfKSign = {
  date: 1548426397,
  leaf: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff50000000000000000000000000000000000007833000000000000000000000004',
  proofs: [
    {
      aux: {
        version: 0,
        era: 0,
        ethAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22'
      },
      mtp0: '0000000000000000000000000000000000000000000000000000000000000000',
      mtp1: '030000000000000000000000000000000000000000000000000000000000000028f8267fb21e8ce0cdd9888a6e532764eb8d52dd6c1e354157c78b7ea281ce801541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed',
      root: '1d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c3922'
    }, {
      aux: null,
      mtp0: '0000000000000000000000000000000000000000000000000000000000000000',
      mtp1: '0300000000000000000000000000000000000000000000000000000000000000182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
      root: '083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f8199'
    }
  ],
  signature: '000c3f2ecd731905c8ce1e05de6a1edd09fe06611fef1cd700d3a84537bf6dc21e7b8f158f252cc583542c449b824cbf21080b9c5b46d27c036ceb32f51c2d2801'
};

describe('[protocol] login', () => {
  it('test bigint', () => {
    bigInt(8).toString();
    bigInt(8).shiftLeft(2);
  });

  it('test check proof', () => {
    const leaf = '0x'
    + '0000000000000000000000000000000000000000000000000000000000000000'
    + '000000000000000000000000393939393939393939393939393939393939393a'
    + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
    + '0000000000000000000000000000000000000000000000010000000000000003';
    const proof = '0x'
    + '000600000000000000000000000000000000000000000000000000000000002f'
    + '096c4844ff1a371253894c44bbc7b79915ba5a08868a19cdd4ff669ba5bf4d67'
    + '0ce08b5f71063762286214277d6d46ee0ecc1430f214daf597966c71f681ada2'
    + '25ae1d27a7d498d5eded2d259bac59899ea063135e91d989f5a163425de75dd2'
    + '0cf77fa54111c30805962fb39fad88302d250dca1de63c71dd3a95ba5c11450e'
    + '20696d87aeec38c4fb986bdfb6bed824173370cfd75cb4a8e907900278054d68';
    const root = '0x143ff097f932cd5f9964323cd1225cc26f2265a4b68b29e539f70af0902b204b';

    const entry = new Entry();
    entry.fromHexadecimal(leaf);
    const res = smt.checkProof(root, proof, iden3.utils.bytesToHex(entry.hi()), iden3.utils.bytesToHex(entry.hv()));
    expect(res).to.be.equal(true);
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
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, usrAddr, ethName, kc, ksign, proofOfKSign, proofOfEthName, expirationTime);

    const verified = iden3.protocols.login.verifySignedPacket(signedPacket);
    expect(verified).to.be.equal(true);
  });
});
