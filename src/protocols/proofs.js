// @flow
import { Entry } from '../claim/entry/entry';
import { SetRootKey } from '../claim/set-root-key/set-root-key';

const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const mtHelpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const claimHelpers = require('../claim/claim-utils.js');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');

/**
 * Auxiliary data required to build a set root claim
 */
class SetRootAux {
  idAddr: string;
  ver: number;
  era: number;

  constructor(idAddr: string, version: number, era: number) {
    this.idAddr = idAddr;
    this.ver = version;
    this.era = era;
  }
}

/**
 * Class representing a merkle tree proof of existence of a leaf, a merkle tree
 * proof of non existence of the same leaf with the following version */
class ProofClaimPartial {
  mtp0: string;
  mtp1: string;
  root: string;
  aux: ?SetRootAux;

  /**
   * Create an MtpProof
   * @param {MerkleTreeProof} mtp0
   * @param {MerkleTreeProof} mtp1
   * @param {key} root
   * @param {SetRootAux|null} aux
   */
  constructor(mtp0: string, mtp1: string, root: string, aux: ?SetRootAux) {
    this.mtp0 = mtp0;
    this.mtp1 = mtp1;
    this.root = root;
    this.aux = aux;
  }
}

/** Class representing proof of a valid claim, from the claim to the top level
 * tree root, including proofs of non-existence of the revoked/next version of
 * each claim.  Includes the top level tree root key signature by the owner of
 * the top level tree. */
class ProofClaim {
  signature: string;
  date: number;
  leaf: string;
  proofs: Array<ProofClaimPartial>;
  /**
   * Create a ClaimProof
   * @param {Signature} rootKeySig
   * @param {Number} date
   * @param {Leaf} leaf
   * @param {[]ProofClaimPartial} proofs
   */
  constructor(rootKeySig: string, date: number, leaf: string, proofs: Array<ProofClaimPartial>) {
    this.signature = rootKeySig;
    this.date = date;
    this.leaf = leaf;
    this.proofs = proofs;
  }
}

/**
 * Verify a ProofClaim from the claim to the blockchain root
 * Message signed is built as: | rootKey | Date |
 * @param {ProofClaim} proof - Full data of claim in order to be verified
 * @param {String} relayAddr - Public address that has signed: | rootKey | Date |
 */
function verifyProofClaim(proof: ProofClaim, relayAddr: string): boolean {
  // Verify that signature(proof.proofs[proof.proofs.length - 1].root) === proof.rootKeySig
  let rootK = proof.proofs[proof.proofs.length - 1].root;
  if (rootK.substr(0, 2) !== '0x') {
    rootK = `0x${rootK}`;
  }
  // const date = proof.proofs[proof.proofs.length - 1].Date;
  const { date } = proof;
  const dateBytes = utils.uint64ToEthBytes(date);
  const dateHex = utils.bytesToHex(dateBytes);
  const msg = `${rootK}${dateHex.slice(2)}`;
  const msgBuffer = ethUtil.toBuffer(msg);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
  const msgHashHex = utils.bytesToHex(msgHash);
  const sig = utils.hexToBytes(proof.signature);
  sig[64] += 27;
  const signatureHex = utils.bytesToHex(sig);
  if (!utils.verifySignature(msgHashHex, signatureHex, relayAddr)) { // mHex, sigHex, addressHex
    // if (!utils.verifySignature(msg, proof.rootSig, relayAddr)) {  mHex, sigHex, addressHex
    return false;
  }

  // For now we only allow proof verification of Nameserver (one level) and
  // Relay (two levels: relay + user)
  if (proof.proofs.length > 2 || proof.proofs.length < 1) {
    return false;
  }

  let leaf = Entry.newFromHex(proof.leaf);
  let rootKey = '';
  for (let i = 0; i < proof.proofs.length; i++) {
    // for (var i = proof.proofs.length-1; i>=0; i--) {
    const mtpEx = proof.proofs[i].mtp0;
    const mtpNoEx = proof.proofs[i].mtp1;
    // WARNING: leafNoEx points to the same content of leaf, so modifying leafNoEx modifies leaf!
    // var leafNoEx = leaf
    // incClaimVersion(leafNoEx)
    rootKey = proof.proofs[i].root;

    if (!mtHelpers.isMerkleTreeProofExistence(mtpEx)) {
      return false;
    }
    if (smt.checkProof(rootKey, mtpEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      return false;
    }
    if (mtHelpers.isMerkleTreeProofExistence(mtpNoEx)) {
      return false;
    }
    claimHelpers.incClaimVersion(leaf);
    if (smt.checkProof(rootKey, mtpNoEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      return false;
    }

    if (i === proof.proofs.length - 1) {
      break;
    }
    if (proof.proofs[i].aux == null) {
      return false;
    }
    const { ver, era, idAddr } = proof.proofs[i].aux;
    leaf = SetRootKey.new(ver, era, idAddr, rootKey).toEntry();
  }

  return true;
}

module.exports = {
  verifyProofClaim,
  ProofClaim,
  ProofClaimPartial,
  SetRootAux,
};
