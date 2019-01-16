const ethUtil = require('ethereumjs-util');

const utils = require('../utils');

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

/** Class representing a claim proof */
class ProofClaimFull {
  /**
   * Create a ClaimProof
   * @param {Key} rootKey
   * @param {Signature} rootKeySig
   * @param {[]MtpProof} mtpProofs
   * @param {[]SetRootAux} setRootAuxs Auxiliary data to build intermediate set root claims
   * @param {Leaf} leaf
   */
  constructor(rootKey, rootKeySig, leaf, mtpProofs, setRootAuxs) {
    this.rootKey = rootKey;
    this.rootKeySig = rootKeySig;
    this.mtpProofs = mtpProofs;
    this.setRootAuxs = setRootAuxs;
    this.leaf = leaf;
    return this;
  }
}

const verifyProofClaimFull = function verifyProofClaimFull(proofClaimFull) {
  // TODO? Verify proofClaimFull.rootKeySig
  if (proofClaimFull.mtpProofs.length > 2 || proofClaimFull.mtpProofs.length < 1) {
    return false; // TODO throw error
  }
  if (proofClaimFull.mtpProofs.length - 1 != proofClaimFull.setRootAuxs.length)

  var leaf = proofClaimFull.leaf;
  var rootKey = '';
  for (var i = 0; i < proofClaimFull.proofs.length; i++) {
    _mtpEx = proofClaimFull.mtpProofs[i].mtpLeaf
    _mtpNoEx = proofClaimFull.mtpProofs[i].mtpLeafP1
    mtpEx = parseClaim(_mtpEx) // TODO
    mtpNoEx = parseClaim(_mtpNoEx) // TODO
    var leafNoEx = leaf
    setClaimVersion(leafNoEx, leaf.version + 1) // TODO

    if (mtpEx.existence != true) {
      return false; // TODO throw error
    }
    if (verifyMtp(mtpEx, leaf) != true) {
      return false; // TODO throw error
    }
    if (mtpNoEx.existence != false) {
      return false; // TODO throw error
    }
    if (verifyMtp(mtpNoEx, leafNoEx) != true) {
      return false; // TODO throw error
    }

    rootKey = mtpEx.rootKey;
    if (i === proofClaimFull.proofs.length-1) {
      break;
    }
    const version = proofClaimFull.setRootAuxs[i].version;
    const era = proofClaimFull.setRootAuxs[i].era;
    const ethId = proofClaimFull.setRootAuxs[i].ethId;
    leaf = newSetRootClaim(version, era, ethId, rootKey);
  }
  if (rootKey != proofClaimFull.rootKey) {
    return false;
  }
  if (checkRootKeyInBlockchain(rootKey) != true) { // TODO
    return false;
  }
  return true;
}

/**
 * Class representing a merkle tree proof of existence of a leaf, a merkle tree
 * proof of non existence of the same leaf with the following version */
class MtpProof {
  /**
   * Create an MtpProof
   * @param {MerkleTreeProof} mtpLeaf
   * @param {MerkleTreeProof} mtpLeafP1
   * @param {number} version
   * @param {number} era
   */
  constructor(mtpLeaf, mtpLeafP1) {
    this.mtpLeaf = mtpLeaf;
    this.mtpLeafP1 = mtpLeafP1;
  }
}

class SetRootAux {
  constructor(ethId, version, era) {
    this.ethId = ethId
    this.version = version
    this.era = era
  }
}

module.exports = {
  newRequestIdenAssert,
  signIdenAssertV01,
  // signPacket,
  verifyIdenAssertV01,
  verifySignedPacket
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
