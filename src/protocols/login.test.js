// @flow
import {
  describe, it, before, after,
} from 'mocha';
import { Entry } from '../claim/entry';
import { NameResolver, testNamesJSON } from '../api-client/name-resolver';
import { Discovery, testEntitiesJSON } from '../api-client/discovery';
import { SignedPacketVerifier } from './login';

const chai = require('chai');

const { expect } = chai;

const snarkjs = require('snarkjs');
const iden3 = require('../index');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');

const { bigInt } = snarkjs;
// const relayKOpAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayKOp = '117f0a278b32db7380b078cdb451b509a2ed591664d1bac464e8c35a90646796';
// const usrAddr = '0x308eff1357e7b5881c00ae22463b0f69a0d58adb';
const usrAddr = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';

// following proofEthName and proofKSign are generated by go-iden3
const proofEthName = {
  ethName: 'testName@iden3.eth',
  proofAssignName: {
    proofs: [
      {
        mtp0: '0x0001000000000000000000000000000000000000000000000000000000000001066996bfceb028398017cf44ef9e6aab2a13412b7dc9ee00d90a305cb97ae78e',
        mtp1: '0x0301000000000000000000000000000000000000000000000000000000000001301a38afef4b2e600259190ab68ee7dddd194766d4ba90c93f49e8310a1b5cba20b468baa588865efc5df741e0a48569aa1171143a8627f425fff0d4fa7803c7022a1e2c3a59747c79b0cddee114e3bfb2d24777281ed568b364d43a6eea33a8',
        root: '0x1c5d63fcb41321f5648ec038d852a345a4c08434896fac8dbcc2bde1d8541015',
        aux: null,
      },
    ],
    leaf: '0x00000000000000000000000000000000000000000000000000000000000000000000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f400178118069763dbe18ad9c512b09b4f9a9b7ae14c4ead00200ceabdcbac85950000000000000000000000000000000000000000000000000000000000000003',
    date: 1559221970,
    signature: 'ea74d9bc7c392a162797e9d22d7ea9a8cf41f5193398048cdf5a972edf321c001a198c6ff8320454462dbf5cbf1e4adf04f3b582107303bd752c62648577b000',
    signer: '1N7d2qVEJeqnYAWVi5Cq6PLj6GwxaW6FYcfmY2fps',
  },
};

// relay: 11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij
// user: 1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z

const proofKSign = {
  proofs: [
    {
      mtp0: '0x000100000000000000000000000000000000000000000000000000000000000125024058dff8730e7c283b2eb8b1553f32b5db48b2dc3499f1f610591b7cb5ab',
      mtp1: '0x0302000000000000000000000000000000000000000000000000000000000003286bbd1d59ecc50d86dbb5ee59e2997d3522d378b0eb70a86fa38e99bc48179d1e7604b4b32e21da52f5f8a0ccf9709e378e033a9c1d458c4d426d57e53f629b2ca6f7a21d09938e1b52786f8b525b19832a84bb59c8ba4de6871728854f60af29af7742f31e4dfe967485d2e10d4f040d3f53236587b7de64717b871e661f84',
      root: '0x14a946742e18446a877932c0938511bb6df3c77329ccd9c9cab5981212ffff17',
      aux: {
        version: 0,
        era: 0,
        id: '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z',
      },
    },
    {
      mtp0: '0x0000000000000000000000000000000000000000000000000000000000000000',
      mtp1: '0x030000000000000000000000000000000000000000000000000000000000000020b468baa588865efc5df741e0a48569aa1171143a8627f425fff0d4fa7803c7022a1e2c3a59747c79b0cddee114e3bfb2d24777281ed568b364d43a6eea33a8',
      root: '0x066996bfceb028398017cf44ef9e6aab2a13412b7dc9ee00d90a305cb97ae78e',
      aux: null,
    },
  ],
  leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002906dcb03d2b068326665e02759eff24d35d40522d9e6efd8e29fb299f67bb1c0000000000000000000000000000000000000001000000000000000000000001',
  date: 1559221970,
  signature: '2d76607dbd65092adb64a6c64f76946f8c75b9e23d208e2abd1fac0e287063279aa2c6dde9ba47219d403b61c3698e3a0e2204e1d40630ab8180bc8102cd3600',
  signer: '1N7d2qVEJeqnYAWVi5Cq6PLj6GwxaW6FYcfmY2fps',
};

describe('[protocol]', () => {
  let db;
  let kc;
  let kOperational;
  let signedPacketVerifier;

  before('initialize objects', () => {
    const discovery = new Discovery(testEntitiesJSON);
    const nameResolver = new NameResolver(testNamesJSON);
    signedPacketVerifier = new SignedPacketVerifier(discovery, nameResolver);
    db = new iden3.Db.LocalStorage();
    kc = new iden3.KeyContainer(db);
    kc.unlock('pass');
  });

  after('lock key container', () => {
    kc.lock();
  });

  it('create operation key', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    kc.setMasterSeed(mnemonic);
    // const keys = kc.createKeys();
    // kOperational = keys.kOp;
    kOperational = kc.importBabyKey('9b3260823e7b07dd26ef357ccfed23c10bcef1c85940baa3d02bbf29461bbbbe');
  });

  it('test bigint', () => {
    // check that node version supports shiftLeft on bigInt
    bigInt(8).toString();
    bigInt(8).shl(2);
  });

  it('test check proof', () => {
    const id = '0x393939393939393939393939393939393939393a';
    const mt = new smt.SparseMerkleTree(db, id, 140);
    // Add 10 test entries to sparse merkle tree
    for (let i = 0; i < 8; i++) {
      const claim = [bigInt(0), bigInt(0), bigInt(0), bigInt(i)];
      mt.addClaim(claim);
    }
    const leaf = '0x'
    + '0000000000000000000000000000000000000000000000000000000000000000'
    + '000000000000000000000000393939393939393939393939393939393939393a'
    + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
    + '0000000000000000000000000000000000000000000000010000000000000003';
    // Add leaf to sparse merkle tree
    const entry = Entry.newFromHex(leaf);
    mt.addClaim(iden3.utils.getArrayBigIntFromBuffArrayBE(entry.elements));
    // generate proof
    const proofBuff = mt.generateProof(iden3.utils.getArrayBigIntFromBuffArrayBE([entry.elements[2], entry.elements[3]]));
    const proof = iden3.utils.bytesToHex(proofBuff);
    const root = iden3.utils.bytesToHex(mt.root);
    const verified = smt.checkProof(root, proof, iden3.utils.bytesToHex(entry.hi()), iden3.utils.bytesToHex(entry.hv()));
    expect(verified).to.be.equal(true);
  });

  it('verify ProofClaimFull (proofClaimAssignName & proofKSign)', () => {
    const assignNameVerified = iden3.protocols.verifyProofClaimFull(proofEthName.proofAssignName, relayKOp);
    expect(assignNameVerified).to.be.equal(true);

    const ksignVerified = iden3.protocols.verifyProofClaimFull(proofKSign, relayKOp);
    expect(ksignVerified).to.be.equal(true);
  });

  it('newRequestIdenAssert & signIdenAssertV01 & verifySignedPacket', () => {
    const origin = 'domain.io';
    // login backend:
    const nonceDB = new iden3.protocols.nonceDB.NonceDB();
    const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, origin, 2 * 60);

    // check that the nonce is in the nonceDB
    expect(nonceDB.search(signatureRequest.body.data.challenge)).to.be.not.equal(undefined);

    // identity wallet:
    const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, usrAddr,
      { ethName: proofEthName.ethName, proofAssignName: proofEthName.proofAssignName },
      kc, kOperational, proofKSign, 3600 * 60);

    // login backend:
    const res = signedPacketVerifier.verifySignedPacketIdenAssert(signedPacket, nonceDB, origin);
    if (res == null) { return; }

    // check that the nonce returned when deleting the nonce of the signedPacket, is the same
    // than the nonce of the signatureRequest
    expect(res.nonceObj.nonce).to.be.equal(signatureRequest.body.data.challenge);

    // nonce must not be more in the nonceDB
    expect(nonceDB.search(res.nonceObj.nonce)).to.be.equal(undefined);

    expect(res.ethName).to.be.equal(proofEthName.ethName);
    expect(res.id).to.be.equal(usrAddr);

    // check that an already checked signedPacket is not more longer available to be verified
    expect(() => {
      signedPacketVerifier.verifySignedPacketIdenAssert(signedPacket, nonceDB, origin);
    }).to.throw('Challenge nonce not found in the DB');
  });
});
