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
class ProofClaim {
  /**
   * Create a ClaimProof
   * @param {Key} rootKey
   * @param {Signature} rootKeySig
   * @param {Leaf} leaf
   * @param {[]Proof} proofs
   * @param {[]EthID} ethids
   */
  constructor(rootKey, rootKeySig, leaf, proofs, ethids) {
    this.rootKey = rootKey;
    this.rootKeySig = rootKeySig;
    this.proofs = proofs;
    this.ethids = ethids;
    this.leaf = leaf;
  }
}

/**
 * Class representing a merkle tree proof of existence of a leaf, a merkle tree
 * proof of non existence of the same leaf with the following version */
class Proof {
  /**
   * Create a Proof
   * @param {MerkleTreeProof} mtpLeaf
   * @param {MerkleTreeProof} mtpLeafP1
   * @param {number} version
   * @param {number} era
   */
  constructor(mtpLeaf, mtpLeafP1, version, era) {
    this.mtpLeaf = mtpLeaf;
    this.mtpLeafP1 = mtpLeafP1;
    this.version = version;
    this.era = era;
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
