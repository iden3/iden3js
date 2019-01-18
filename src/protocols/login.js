const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const Entry = require('../claim/entry/entry');

const mtHelpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');

const SIGV01 = 'iden3.sig.v0_1';
const IDENASSERTV01 = 'iden3.iden_assert.v0_1';
const SIGALGV01 = 'ES255';

// for login purposes
/**
* New RequestIdenAssert
* @param {String} origin
* @param {String} sessionId
* @param {Number} timeout
* @returns {Object} requestIdenAssert
*/
const newRequestIdenAssert = function newRequestIdenAssert(origin, sessionId, timeout) {
  const nonce = 'generate cryptografically random nonce'; // TODO
  return {
    header: {
      typ: SIGV01
    },
    body: {
      type: IDENASSERTV01,
      data: {
        challenge: nonce,
        timeout: timeout,
        origin: origin,
        sessionId: sessionId
      }
    }
  };
};

/*
const signPacket = function signPacket(signatureRequest, ethid, kc, ksign, proofOfKSign) {
  let result = {};
  // switch que crida a la funció d'omplenar payload
  if (signatureRequest.header.typ != SIGV01) {
    return; // TODO
  }
  switch (signatureRequest.body.type) {
    case IDENASSERTV01:
      result = signIdenAssertV01(signatureRequest, kc, ksign, proofOfKSign);
      break;
    default:
      return; // TODO
  }
  return result;
};
*/

const signIdenAssertV01 = function signIdenAssertV01(signatureRequest, ethid, ethName, kc, ksign, proofOfKSign, proofOfEthName, expirationTime) {
  const date = new Date();
  const currentTime = Math.round((date).getTime() / 1000);
  const jwsHeader = {
    typ: SIGV01,
    iss: ethid,
    iat: currentTime,
    exp: expirationTime,
    alg: SIGALGV01
  };
  const jwsPayload = {
    type: IDENASSERTV01,
    data: signatureRequest.body.data,
    ksign: ksign,
    proofOfKSign: proofOfKSign, // proofOfClaimAssignName
    form: {
      ethName: ethName,
      proofOfEthName: proofOfEthName, // proofOfClaimAssignName
    }
  };

  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');

  const dataToSign = header64 + "." + payload64;

  // sign data
  const signedObj = kc.sign(ksign, dataToSign);
  const signatureHex = signedObj.signature;
  const signatureBuffer = utils.hexToBytes(signatureHex);
  const signature64 = signatureBuffer.toString('base64');

  const result = dataToSign + '.' + signature64;
  return result;
};

/**
 * Verify an identity assertio v0.1 signed packet
 */
const verifyIdenAssertV01 = function verifyIdenAssertV01(jwsHeader, jwsPayload, signatureBuffer) {
  // TODO check data structure scheme

  if (jwsHeader.alg !== SIGALGV01) {
    return false; // TODO
  }
  /*
    // TODO uncoment when the proofOfKSign is ready
    if (jwsPayload.proofOfKSign.proofs.length > 2) {
      return false;
    }
    if (jwsPayload.proofOfKSign.ethids.length !== jwsPayload.proofOfKSign.proofs.length) {
      return false;
    }
    // TODO verify proofOfKSign
  */
  const date = new Date();
  const current = Math.round((date).getTime() / 1000);
  if (!((jwsHeader.iat < current) && (current < jwsHeader.exp))) {
    return false; // TODO
  }

  const ksign = ''; // TODO get ksign from jwsPayload.proof_ksign.leaf

  // NOTE: verifying a signature is cheaper than verifying a merkle tree proof.
  // This should go before the verification of proofOfKSigns and
  // proofOfEthName.
  // verify signature with ksign
  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');
  const dataSigned = header64 + "." + payload64;
  const message = ethUtil.toBuffer(dataSigned);
  const msgHash = ethUtil.hashPersonalMessage(message);
  const sigHex = utils.bytesToHex(signatureBuffer);
  console.log('verifySignature', utils.verifySignature(utils.bytesToHex(msgHash), sigHex, jwsPayload.ksign));
  if (!utils.verifySignature(utils.bytesToHex(msgHash), sigHex, jwsPayload.ksign)) { // mHex, sigHex, addressHex
    return false;
  }

  // TODO verify that signature is by jwsHeader.iss

  // TODO verify proofOfEthName

  return true;
};

/**
 * Verify a signed packet
 */
const verifySignedPacket = function verifySignedPacket(signedPacket) {
  // extract jwsHeader and jwsPayload and signatureBuffer in object
  const jwsHeader64 = signedPacket.split('.')[0];
  const jwsPayload64 = signedPacket.split('.')[1];
  const signature64 = signedPacket.split('.')[2];
  const jwsHeader = JSON.parse(Buffer.from(jwsHeader64, 'base64').toString('ascii'));
  const jwsPayload = JSON.parse(Buffer.from(jwsPayload64, 'base64').toString('ascii'));
  const signatureBuffer = Buffer.from(signature64, 'base64');

  let verified = false;
  // switch over jwsHeader.typ
  switch (jwsHeader.typ) {
    case SIGV01:
      verified = verifyIdenAssertV01(jwsHeader, jwsPayload, signatureBuffer);
      break;
    default:
      return false;
  }
  return verified;
};

// for general purposes

/** Class representing proof of a valid claim, from the claim to the top level
 * tree root, including proofs of non-existence of the revoked/next version of
 * each claim.  Includes the top level tree root key signature by the owner of
 * the top level tree. */
class ProofClaimFull {
  /**
   * Create a ClaimProof
   * @param {Signature} rootKeySig
   * @param {Leaf} leaf
   * @param {[]ProofClaim} proofs
   */
  constructor(rootKeySig, leaf, proofs) {
    this.rootSig = rootKeySig;
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
  constructor(ethId, version, era) {
    this.ethId = ethId;
    this.ver = version;
    this.era = era;
  }
}

// TODO: Move this to claim utils
const incClaimVersion = function incClaimVersion(claim) {
  //let entry = new Entry();
  //entry.fromHexadecimal(claim);
  const version = claim.elements[3].slice(20, 24).readUInt32BE(0);
  claim.elements[3].writeUInt32BE(version+1, claim.elements[3].length - 64/8 - 32/8);
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
const verifyProofClaimFull = function verifyProofClaimFull(proof) {
  // TODO? Verify that signature(proof.proofs[0].root) === proof.rootKeySig

  // For now we only allow proof verification of Nameserver (one level) and
  // Relay (two levels: relay + user)
  if (proof.proofs.length > 2 || proof.proofs.length < 1) {
    return false; // TODO throw error
  }

  let leaf = new Entry();
  leaf.fromHexadecimal(proof.leaf);
  var rootKey = '';
  for (var i = 0; i < proof.proofs.length; i++) {
    mtpEx = proof.proofs[i].mtp0
    mtpNoEx = proof.proofs[i].mtp1
    //var leafNoEx = leaf
    //incClaimVersion(leafNoEx)
    rootKey = proof.proofs[i].root

    if (!isMerkleTreeProofExistence(mtpEx)) {
      console.trace(mtpEx);
      return false; // TODO throw error
    }
    console.trace(leaf);
    console.trace(leaf.hi(), leaf.hv());
    if (smt.checkProof(rootKey, mtpEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      console.log("rootKey: " + rootKey);
      console.log("proof: " + mtpEx);
      console.log("hi: " + utils.bytesToHex(leaf.hi()));
      console.log("hv: " + utils.bytesToHex(leaf.hv()));
      console.log("leaf: " + leaf.toHexadecimal());
      console.trace(leaf);
      return false; // TODO throw error
    }
    if (isMerkleTreeProofExistence(mtpNoEx)) {
      console.trace();
      return false; // TODO throw error
    }
    incClaimVersion(leaf)
    if (smt.checkProof(rootKey, mtpNoEx, utils.bytesToHex(leaf.hi()), utils.bytesToHex(leaf.hv())) !== true) {
      console.trace();
      return false; // TODO throw error
    }

    if (i === proof.proofs.length-1) {
      break;
    }
    const version = proof.proofs[i].aux.ver;
    const era = proof.proofs[i].aux.era;
    const ethId = proof.proofs[i].aux.ethId;
    leaf = newSetRootClaim(version, era, ethId, rootKey);
  }
  if (checkRootKeyInBlockchain(rootKey) !== true) { // TODO
    // TODO: maybe check root signature
    console.trace();
    return false;
  }
  console.trace();
  return true;
}

module.exports = {
  newRequestIdenAssert,
  signIdenAssertV01,
  // signPacket,
  verifyIdenAssertV01,
  verifySignedPacket,
  verifyProofClaimFull,
  ProofClaimFull,
  MtpProof,
  SetRootAux
};

/*
- crear paquet per firmar
	- request de firma específic per login

- sign

verificar paquet firmat:
- switch
	- header.typ=='iden3.sig.v0_1`
		- parse JWS_PAYLOAD i JWS_HEADER
		- verificar objecte del tipus iden3.sig.v0_1
			- verificar JWS_HEADER.alg=='el que toca'
		- verificar que JWS_PAYLOAD.proof_ksgin.proofs.length<=2
		- verificar que JWS_PAYLOAD.proof_ksgin.ethids.length=JWS_PAYLOAD.proof_ksgin.proofs.length - 1
		- verificar paràmetres del JWS_HEADER
			- iat < current < exp
		- agafar ksign de JWS_PAYLOAD.proof_ksign.leaf
		- verificar firma amb ksign
		- verificar que la firma correspon a l' JWT_HEADER.iss
			- issuer == proof_ksign.ethid 				(PENDENT)
			- verificar validesa de JWS_PAYLOAD.proof_ksign
				- verificar els 4 merkle proofs
				- verificar que el root és vàlid per aquell relay
					- o mirant la blockchain
					- o mirant que estigui firmat pel relay
*/
