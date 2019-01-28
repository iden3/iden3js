const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const claim = require('../claim/claim');
const CONSTANTS = require('../constants');
const Entry = require('../claim/entry/entry');
const proofs = require('./proofs');

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
const signPacket = function signPacket(signatureRequest, usrAddr, kc, ksign, proofOfKSign) {
  let result = {};
  // switch que crida a la funció d'omplenar payload
  if (signatureRequest.header.typ != SIGV01) {
    return;
  }
  switch (signatureRequest.body.type) {
    case IDENASSERTV01:
      result = signIdenAssertV01(signatureRequest, kc, ksign, proofOfKSign);
      break;
    default:
      return;
  }
  return result;
};
*/

const signIdenAssertV01 = function signIdenAssertV01(signatureRequest, ethAddr, ethName, proofOfEthName, kc, ksign, proofOfKSign, expirationTime) {
  const date = new Date();
  const currentTime = Math.round((date).getTime() / 1000);
  const jwsHeader = {
    typ: SIGV01,
    iss: ethAddr,
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

  const dataToSign = header64 + '.' + payload64;

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

  // check if jwsHeader.alg is iden3.sig.v0_1 (SIGALGV01)
  if (jwsHeader.alg !== SIGALGV01) {
    return false;
  }

  // check that jwsPayload.proofOfKSign.proofs.length < 2
  if (jwsPayload.proofOfKSign.proofs.length>2) {
    return false;
  }

  // check times iat < current < exp
  const date = new Date();
  const current = Math.round((date).getTime() / 1000);
  if (!((jwsHeader.iat <= current) && (current <= jwsHeader.exp))) {
    console.trace();
    return false;
  }

  // TODO check jwsPayload.ksign with jwsPayload.proofOfKSign.Leaf
  // get ClaimAuthorizeKSign from jwsPayload.proofOfKSign.leaf
  const claimAuthorizeKSign = claim.parseAuthorizeKSignClaim(jwsPayload.proofOfKSign.leaf);
  if (claimAuthorizeKSign.extraIndex.keyToAuthorize!==jwsPayload.ksign) {
	console.trace();
 	return false; 
  }

  // TODO check that jwsPayload.form.proofOfEthName == jwsPayload.form.ethName == jwsHeader.iss
  // get ClaimAssignName from jwsPayload.form.proofOfEthName.leaf

  // check verify signature with jwsPayload.ksign
  // as verifying a signature is cheaper than verifying a merkle tree proof, first we verify signature with ksign
  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');
  const dataSigned = header64 + '.' + payload64;
  const message = ethUtil.toBuffer(dataSigned);
  const msgHash = ethUtil.hashPersonalMessage(message);
  const sigHex = utils.bytesToHex(signatureBuffer);
  if (!utils.verifySignature(utils.bytesToHex(msgHash), sigHex, jwsPayload.ksign)) { // mHex, sigHex, addressHex
    console.trace();
    return false;
  }

  // TODO verify that signature is by jwsHeader.iss

  const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';


  // verify proofOfEthName
  if (!proofs.verifyProofClaimFull(jwsPayload.form.proofOfEthName.proofOfClaimAssignName, relayAddr)) {
 	return false; 
  }


  // check jwsPayload.proofOfKSign
  if (!proofs.verifyProofClaimFull(jwsPayload.proofOfKSign, relayAddr)) {
    return false;
  }

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


module.exports = {
  newRequestIdenAssert,
  signIdenAssertV01,
  // signPacket,
  verifyIdenAssertV01,
  verifySignedPacket,
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
		// ja no, per la nova estructura de dades - verificar que JWS_PAYLOAD.proof_ksgin.ethaddrs.length=JWS_PAYLOAD.proof_ksgin.proofs.length - 1
		- verificar paràmetres del JWS_HEADER
			- iat < current < exp
		- agafar ksign de JWS_PAYLOAD.proof_ksign.leaf
		- verificar firma amb ksign
		- verificar que la firma correspon a l' JWT_HEADER.iss
			- issuer == proof_ksign.ethaddr 				(PENDENT)
			- verificar validesa de JWS_PAYLOAD.proof_ksign
				- verificar els 4 merkle proofs
				- verificar que el root és vàlid per aquell relay
					- o mirant la blockchain
					- o mirant que estigui firmat pel relay
*/
