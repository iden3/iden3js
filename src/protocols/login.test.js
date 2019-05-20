// @flow
import {
  describe, it, before, after,
} from 'mocha';
import { Entry } from '../claim/entry/entry';
import { NameResolver, testNamesJSON } from '../http/name-resolver';
import { Discovery, testEntitiesJSON } from '../http/discovery';
import { SignedPacketVerifier } from './login';

const chai = require('chai');

const { expect } = chai;

const snarkjs = require('snarkjs');
const iden3 = require('../index');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');

const { bigInt } = snarkjs;
// const relayKOpAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayKOpAddr = '0x7633bc9012f924100fae50d6dda7162b0bba720d';
// const usrAddr = '0x308eff1357e7b5881c00ae22463b0f69a0d58adb';
const usrAddr = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';

// following proofEthName and proofKSign are generated by go-iden3
const proofEthName = {
  ethName: 'testName@iden3.eth',
  proofAssignName: {
  proofs: [
    {
      mtp0: '0x00010000000000000000000000000000000000000000000000000000000000011b7a0d2cdea1bd692f8fae6fafa774a4dc8fe28be8f81e464d259a603079e4c5',
      mtp1: '0x0301000000000000000000000000000000000000000000000000000000000001301a38afef4b2e600259190ab68ee7dddd194766d4ba90c93f49e8310a1b5cba20b468baa588865efc5df741e0a48569aa1171143a8627f425fff0d4fa7803c701bfeaf3af8775cbd1884bde8bec9762d167dcd4c77b3eafa13f938364b89772',
      root: '0x145cddc2ccb3f46c288e41f53a40c7176920aaf1a10e657455b4a6af9d99a267',
      aux: null
    }
  ],
  leaf: '0x00000000000000000000000000000000000000000000000000000000000000000000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f400178118069763dbe18ad9c512b09b4f9a9b7ae14c4ead00200ceabdcbac85950000000000000000000000000000000000000000000000000000000000000003',
  date: 1558363921,
  signature: '0x1778ab9f274186dd4bba64a93b592e7f01aad7a953b7269b0b955e62216018472a1344353a22bb5cb91610c73ae6ba3efbb360daecc9a61671aaac9e97e67b131c',
  signer: '11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij'
  },
};

// relay: 11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij
// user: 1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z

const proofKSign = {
  proofs: [
    {
      mtp0: '0x00020000000000000000000000000000000000000000000000000000000000022910a6fba42851f8282e0266c887e09db4fd84975a76a6c6ce468651683d2346',
      mtp1: '0x010100000000000000000000000000000000000000000000000000000000000125024058dff8730e7c283b2eb8b1553f32b5db48b2dc3499f1f610591b7cb5ab',
      root: '0x2ad101bc0d0e1b1efa9e74d03f017f531016e1b77c7cd5f514c864e8f4f22f90',
      aux: {
        version: 0,
        era: 0,
        idAddr: '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z',
      },
    },
    {
      mtp0: '0x0000000000000000000000000000000000000000000000000000000000000000',
      mtp1: '0x030000000000000000000000000000000000000000000000000000000000000020b468baa588865efc5df741e0a48569aa1171143a8627f425fff0d4fa7803c701bfeaf3af8775cbd1884bde8bec9762d167dcd4c77b3eafa13f938364b89772',
      root: '0x1b7a0d2cdea1bd692f8fae6fafa774a4dc8fe28be8f81e464d259a603079e4c5',
      aux: null,
    },
  ],
  leaf: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff50000000000000000000000000000000000007833000000000000000000000004',
  date: 1558091875,
  signature: '0x99314ccf4e79472f55019ce348c7f367bc1a8a508bd43c972aa586d0f8bf198c53aea3b40a86bf9a3fba5c8cdadc3bb01c94b3432f9ccce4493ad01ef46dffbb1c',
  signer: '11AVZrKNJVqDJoyKrdyaAgEynyBEjksV5z2NjZoWij',
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
    db = new iden3.Db();
    kc = new iden3.KeyContainer('localStorage', db);
    kc.unlock('pass');
  });

  after('lock key container', () => {
    kc.lock();
  });

  it('create operation key', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    kc.generateMasterSeed(mnemonic);
    const mnemonicDb = kc.getMasterSeed();
    kc.generateKeySeed(mnemonicDb);
    const { keySeed, pathKey } = kc.getKeySeed();
    const objectKeys = kc.generateKeysFromKeyPath(keySeed, pathKey);
    const { keys } = objectKeys;
    const kSign = keys[0];
    kOperational = kSign;
  });

  it('test bigint', () => {
    // check that node version supports shiftLeft on bigInt
    bigInt(8).toString();
    bigInt(8).shl(2);
  });

  it('test check proof', () => {
    const idAddr = '0x393939393939393939393939393939393939393a';
    const mt = new smt.SparseMerkleTree(db, idAddr, 140);
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
    const assignNameVerified = iden3.protocols.verifyProofClaimFull(proofEthName.proofAssignName, relayKOpAddr);
    expect(assignNameVerified).to.be.equal(true);

    const ksignVerified = iden3.protocols.verifyProofClaimFull(proofKSign, relayKOpAddr);
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
    expect(res.idAddr).to.be.equal(usrAddr);

    // check that an already checked signedPacket is not more longer available to be verified
    expect(() => {
      signedPacketVerifier.verifySignedPacketIdenAssert(signedPacket, nonceDB, origin);
    }).to.throw('Challenge nonce not found in the DB');
  });
});
