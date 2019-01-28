const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const Entry = require('../claim/entry/entry');
const mtHelpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');
const claim = require('../claim/claim');
const CONSTANTS = require('../constants');

/** Class representing proof of a valid claim, from the claim to the top level
 * tree root, including proofs of non-existence of the revoked/next version of
 * each claim.  Includes the top level tree root key signature by the owner of
 * the top level tree. */
class ProofClaimFull {
  /**
   * Create a ClaimProof
   * @param {Signature} rootKeySig
   * @param {Number} date
   * @param {Leaf} leaf
   * @param {[]ProofClaim} proofs
   */
  constructor(rootKeySig, date, leaf, proofs) {
    this.signature = rootKeySig;
    this.date = date;
    this.leaf = leaf;
    this.proofs = proofs;
  }
}

/**
 * Class representing a merkle tree proof of existence of a leaf, a merkle tree
 * proof of non existence of the same leaf with the following version */
class MtpProof {
  /**
   * Create an MtpProof
   * @param {MerkleTreeProof} mtp0
   * @param {MerkleTreeProof} mtp1
   * @param {key} root
   * @param {SetRootAux|null} aux
   */
  constructor(mtp0, mtp1, root, aux) {
    this.mtp0 = mtp0;
    this.mtp1 = mtp1;
    this.root = root;
    this.aux = aux;
  }
}

/**
 * Auxiliary data required to build a set root claim
 */
class SetRootAux {
  constructor(ethAddr, version, era) {
    this.ethAddr = ethAddr;
    this.ver = version;
    this.era = era;
  }
}

// TODO: Move this to claim utils
const incClaimVersion = function incClaimVersion(claim) {
  //let entry = new Entry();
  //entry.fromHexadecimal(claim);
  const version = claim.elements[3].slice(20, 24).readUInt32BE(0);
  claim.elements[3].writeUInt32BE(version + 1, claim.elements[3].length - 64 / 8 - 32 / 8);
}

// TODO: Move this to merkle-tree utils
const isMerkleTreeProofExistence = function isMerkleTreeProofExistence(proofHex) {
  const proofBuff = mtHelpers.parseProof(proofHex);
  const flagNonExistence = mtHelpers.getBit(proofBuff.flagExistence, 0);
  return !flagNonExistence;
}

/**
 * Verify a ProofClaimFull from the claim to the blockchain root
 * @param{ProofClaimFull} proof
 */
const verifyProofClaimFull = function verifyProofClaimFull(proof, relayAddr) {
  // Verify that signature(proof.proofs[proof.proofs.length - 1].root) === proof.rootKeySig
  let rootK = proof.proofs[proof.proofs.length - 1].root;
  if (rootK.substr(0, 2) !== '0x') {
    rootK = '0x' + rootK;
  }
  // const date = proof.proofs[proof.proofs.length - 1].Date;
  const date = proof.date;
  const dateBytes = utils.uint64ToEthBytes(date);
  const dateHex = utils.bytesToHex(dateBytes);
  const msg = `${rootK}${dateHex.slice(2)}`;
  const msgBuffer = ethUtil.toBuffer(msg);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
  const msgHashHex = utils.bytesToHex(msgHash);
  let sig = utils.hexToBytes(proof.signature);
  sig[64] += 27;
  const signatureHex = utils.bytesToHex(sig);
  if (!utils.verifySignature(msgHashHex, signatureHex, relayAddr)) { // mHex, sigHex, addressHex
    // if (!utils.verifySignature(msg, proof.rootSig, relayAddr)) {  mHex, sigHex, addressHex
    console.trace();
    return false;
  }

  // For now we only allow proof verification of Nameserver (one level) and
  // Relay (two levels: relay + user)
  if (proof.proofs.length > 2 || proof.proofs.length < 1) {
    console.trace();
    return false;
  }

  let leaf = new Entry();
  leaf.fromHexadecimal(proof.leaf);
  var rootKey = '';
  for (var i = 0; i < proof.proofs.length; i++) {
    // for (var i = proof.proofs.length-1; i>=0; i--) {
    mtpEx = proof.proofs[i].mtp0
    mtpNoEx = proof.proofs[i].mtp1
    // WARNING: leafNoEx points to the same content of leaf, so modifying leafNoEx modifies leaf!
    //var leafNoEx = leaf
    //incClaimVersion(leafNoEx)
    rootKey = proof.proofs[i].root

    if (!isMerkleTreeProofExistence(mtpEx)) {
      console.trace(mtpEx);
      return false;
    }
    // console.trace(leaf);
    // console.trace(leaf.hi(), leaf.hv());
    if (smt.checkProof(rootKey, mtpEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      console.log('rootKey: ' + rootKey);
      console.log('proof: ' + mtpEx);
      console.log('hi: ' + utils.bytesToHex(leaf.hi()));
      console.log('hv: ' + utils.bytesToHex(leaf.hv()));
      console.log('leaf: ' + leaf.toHexadecimal());
      console.trace(leaf);
      return false;
    }
    if (isMerkleTreeProofExistence(mtpNoEx)) {
      console.trace();
      return false;
    }
    incClaimVersion(leaf)
    if (smt.checkProof(rootKey, mtpNoEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      console.trace();
      return false;
    }

    if (i === proof.proofs.length - 1) {
      break;
    }
    const version = proof.proofs[i].aux.ver;
    const era = proof.proofs[i].aux.era;
    const ethAddr = proof.proofs[i].aux.ethAddr;
    // leaf = new iden3.claims.SetRootKey(version, era, ethAddr, rootKey);
    leaf = new claim.Factory(CONSTANTS.CLAIMS.SET_ROOT_KEY.ID, {
      version: version,
      era: era,
      id: ethAddr,
      rootKey: rootKey
    }).createEntry();
  }

  return true;
}

module.exports = {
  verifyProofClaimFull,
  ProofClaimFull,
  MtpProof,
  SetRootAux,
};
