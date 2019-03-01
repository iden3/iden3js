// @flow

import { type NonceObj, NonceDB } from './nonceDB';
import { Entry } from '../claim/entry/entry';
import { AuthorizeKSignSecp256k1 } from '../claim/authorize-ksign-secp256k1/authorize-ksign-secp256k1';
import { AssignName } from '../claim/assign-name/assign-name';

const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const claimUtils = require('../claim/claim-utils');
const proofs = require('./proofs');
// const NonceDB = require('./nonceDB');
const kCont = require('../key-container/key-container');

// Constants of the login protocol
const SIGV01 = 'iden3.sig.v0_1';
const IDENASSERTV01 = 'iden3.iden_assert.v0_1';
const GENERICSIGV01 = 'iden3.gen_sig.v0_1';
const SIGALGV01 = 'EK256K1';

// Temporary hardcoded relay address
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

type RequestIdenAssert = {
  header: {
    typ: string,
  },
  body: {
    type: string,
    data: {
      challenge: string,
      timeout: number,
      origin: string,
    }
  }
};

/**
* New RequestIdenAssert
* for login purposes
* @param {Object} nonceDB
* @param {String} origin
* @param {Number} deltatimeout, in seconds units
* @returns {Object} requestIdenAssert
*/
function newRequestIdenAssert(nonceDB: NonceDB, origin: string, deltatimeout: number): RequestIdenAssert {
  const nonce = crypto.randomBytes(32).toString('base64');
  // const nonce = crypto.randomBytes(32).toString('hex');
  const nonceObj = nonceDB.add(nonce, deltatimeout);
  return {
    header: {
      typ: SIGV01,
    },
    body: {
      type: IDENASSERTV01,
      data: {
        challenge: nonce,
        timeout: nonceObj.timestamp,
        origin,
      },
    },
  };
}

/*
// TODO AFTER MILESTONE
function signPacket(signatureRequest, usrAddr, kc, ksign, proofKSign) {
  let result = {};
  if (signatureRequest.header.typ != SIGV01) {
    return;
  }
  switch (signatureRequest.body.type) {
    case IDENASSERTV01:
      result = signIdenAssertV01(signatureRequest, kc, ksign, proofKSign);
      break;
    default:
      return;
  }
  return result;
}
*/

type JwsHeader = {
    typ: string,
    iss: string,
    iat: number,
    exp: number,
    alg: string,
};

type JwsPayload = {
  type: string,
  data: any,
  ksign: string,
  proofKSign: proofs.ProofClaim,
  form: any,
};

/**
 * Generate and sign a SIGV01 packet with ksign as idAddr
 * @param {Object} kc
 * @param {String} idAddr
 * @param {String} ksign - public key in hex format
 * @param {Object} proofKSign
 * @param {Number} expirationTimeDelta
 * @param {String} payloadType - type of signed packet
 * @param {Object} data
 * @param {Object} form
 * @returns {String} signedPacket
 */
function signPacket(kc: kCont.KeyContainer, idAddr: string, ksign: string, proofKSign: proofs.ProofClaim,
  expirationTimeDelta: number, payloadType: string, data: any, form: any): string {
  const date = new Date();
  const currentTime = Math.round((date).getTime() / 1000);
  const jwsHeader = {
    typ: SIGV01,
    iss: idAddr,
    iat: currentTime,
    exp: currentTime + expirationTimeDelta,
    alg: SIGALGV01,
  };
  const jwsPayload = {
    type: payloadType,
    data,
    ksign,
    proofKSign,
    form,
    // identity: {  TODO AFTER MILESTONE
    //   operational: ,
    //   recovery:,
    //   revoke:,
    //   relayer:,
    //   impl:,
    // }
  };

  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');

  const dataToSign = `${header64}.${payload64}`;

  // sign data
  const signedObj = kc.sign(ksign, dataToSign);
  const signatureHex = signedObj.signature;
  const signatureBuffer = utils.hexToBytes(signatureHex);
  const signature64 = signatureBuffer.toString('base64');

  const result = `${dataToSign}.${signature64}`;
  return result;
}

/**
 * Generate and sign signature packet of type generic
 * @param {Object} kc
 * @param {String} idAddr
 * @param {String} ksign - public key in hex format
 * @param {Object} proofKSign
 * @param {Number} expirationTimeDelta
 * @param {Object} form
 * @returns {String} signedPacket
 */
function signGenericSigV01(kc: kCont.KeyContainer, idAddr: string, ksign: string,
  proofKSign: proofs.ProofClaim, expirationTimeDelta: number, form: any): string {
  return signPacket(kc, idAddr, ksign, proofKSign, expirationTimeDelta, GENERICSIGV01, {}, form);
}


/**
 * Generate and sign signature packet of type identity assertion
 * @param {Object} signatureRequest
 * @param {String} idAddr
 * @param {String} ethName
 * @param {Object} proofEthName
 * @param {Object} kc
 * @param {String} ksign - public key in hex format
 * @param {Object} proofKSign
 * @param {Number} expirationTimeDelta
 * @returns {String} signedPacket
 */
function signIdenAssertV01(signatureRequest: any, idAddr: string,
  ethName: string, proofAssignName: proofs.ProofClaim, kc: kCont.KeyContainer, ksign: string,
  proofKSign: proofs.ProofClaim, expirationTimeDelta: number): string {
  return signPacket(kc, idAddr, ksign, proofKSign, expirationTimeDelta,
    IDENASSERTV01, signatureRequest.body.data, { ethName, proofAssignName });
}

export type IdenAssertRes = {
  nonceObj: NonceObj,
  ethName: string,
  idAddr: string,
};

/**
 * Verify an identity assertio v0.1 signed packet
 * @param {Object} nonceDB
 * @param {String} origin
 * @param {Object} jwsHeader
 * @param {Object} jwsPayload
 * @param {Buffer} signatureBuffer
 * @returns {Object} IdenAssertRes - If verification fails, `undefined` is returned
 */
function verifyIdenAssertV01(nonceDB: NonceDB, origin: string,
  jwsHeader: JwsHeader, jwsPayload: JwsPayload): ?IdenAssertRes {
  // TODO AFTER MILESTONE check data structure scheme

  // 2. Verify jwsPayload.data.origin is origin
  if (jwsPayload.data.origin !== origin) {
    return undefined;
  }

  // 3. Verify jwsPayload.data.challenge is in nonceDB and hasn't expired, delete it
  const nonceResult = nonceDB.searchAndDelete(jwsPayload.data.challenge);
  if (nonceResult == null) {
    return undefined;
  }

  // check that jwsPayload.proofKSign.proofs.length <= 2
  if (jwsPayload.proofKSign.proofs.length > 2) {
    return undefined;
  }

  // 4. Verify that jwsHeader.iss and jwsPayload.form.ethName are in jwsPayload.proofAssignName.leaf
  const entry = Entry.newFromHex(jwsPayload.form.proofAssignName.leaf);
  const claimAssignName = claimUtils.newClaimFromEntry(entry);
  if (!(claimAssignName instanceof AssignName)) {
    return undefined;
  }
  // const nameWithoutDomain = jwsPayload.form.ethName.split('@')[0];
  // check jwsPayload.form.proofAssignName.leaf {hashName} === hash(jwsPayload.form.ethName
  if (utils.bytesToHex(claimAssignName.hashName) !== utils.bytesToHex(utils.hashBytes(jwsPayload.form.ethName).slice(1, 32))) {
    return undefined;
  }
  // check claimAssignName.structure.id = jwsHeader.iss
  if (utils.bytesToHex(claimAssignName.id) !== jwsHeader.iss) {
    return undefined;
  }

  // TODO AFTER MILESTONE verify identity address from counterfactual
  // TODO AFTER MILESTONE check counterfactual address from jwsPayload.identity, address == jwsHeader.iss
  // TODO AFTER MILESTONE check jwsPayload.identity.relay == hardcoded relay address

  // 5. VerifyProofClaim(jwsPayload.form.proofAssignName, relayPk)
  if (!proofs.verifyProofClaim(jwsPayload.form.proofAssignName, relayAddr)) {
    return undefined;
  }

  return {
    nonceObj: nonceResult.nonceObj,
    ethName: jwsPayload.form.ethName,
    idAddr: jwsHeader.iss,
  };
}

/**
 * Verify a signed packet
 * @param {Object} jwsHeader
 * @param {Object} jwsPayload
 * @param {Buffer} signatureBuffer
 * @returns {boolean} result
 */
function verifySignedPacketV01(jwsHeader: JwsHeader, jwsPayload: JwsPayload,
  signatureBuffer: Buffer): boolean {
  // 2. Verify jwsHeader.alg is 'ES255'
  if (jwsHeader.alg !== SIGALGV01) {
    return false;
  }

  // 3. Verify that jwsHeader.iat <= now() < jwsHeader.exp
  const date = new Date();
  const current = Math.round((date).getTime() / 1000);
  // Moving iat 2 minutes in the past to accomodate time shifts in time synchronization.
  if (!((jwsHeader.iat - 120 <= current) && (current < jwsHeader.exp))) {
    return false;
  }

  // 4. Verify that jwsPayload.ksign is in jwsPayload.proofKSign.leaf
  const entry = Entry.newFromHex(jwsPayload.proofKSign.leaf);
  const claimAuthorizeKSign = claimUtils.newClaimFromEntry(entry);
  if (!(claimAuthorizeKSign instanceof AuthorizeKSignSecp256k1)) {
    return false;
  }
  const pubK = claimAuthorizeKSign.pubKeyCompressed;
  const pubKHex = utils.bytesToHex(pubK);
  if (pubKHex !== jwsPayload.ksign) {
    return false;
  }

  // 5. Verify that jwsHeader.iss is in jwsPayload.proofKSign.
  if (jwsPayload.proofKSign.proofs[0].aux == null) {
    return false;
  }
  if (jwsHeader.iss !== jwsPayload.proofKSign.proofs[0].aux.idAddr) {
    return false;
  }

  // 6. Verify that signature of JWS(jwsHeader, jwsPayload) by jwsPayload.ksign is signature
  //
  // As verifying a signature is cheaper than verifying a merkle tree
  // proof, first we verify signature with ksign
  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');
  const dataSigned = `${header64}.${payload64}`;
  const message = ethUtil.toBuffer(dataSigned);
  const msgHash = ethUtil.hashPersonalMessage(message);
  const sigHex = utils.bytesToHex(signatureBuffer);
  const ksignAddr = ethUtil.pubToAddress(jwsPayload.ksign, true);
  const ksignAddrHex = utils.bytesToHex(ksignAddr);
  if (!utils.verifySignature(utils.bytesToHex(msgHash), sigHex, ksignAddrHex)) { // mHex, sigHex, addressHex
    return false;
  }

  // 7. VerifyProofOfClaim(jwsPayload.proofOfKSign, relayPk)
  if (!proofs.verifyProofClaim(jwsPayload.proofKSign, relayAddr)) {
    return false;
  }

  return true;
}

/**
 * Verify a signed packet
 * @param {Object} nonceDB
 * @param {String} origin
 * @param {String} signedPacket
 * @returns {undefined | Object} deserialization output with verification result
 */
function verifySignedPacket(signedPacket: string): ?{ verified: boolean, header: JwsHeader, payload: JwsPayload } {
  // extract jwsHeader and jwsPayload and signatureBuffer in object
  const jwsHeader64 = signedPacket.split('.')[0];
  const jwsPayload64 = signedPacket.split('.')[1];
  const signature64 = signedPacket.split('.')[2];
  const jwsHeader = JSON.parse(Buffer.from(jwsHeader64, 'base64').toString('ascii'));
  const jwsPayload = JSON.parse(Buffer.from(jwsPayload64, 'base64').toString('ascii'));
  const signatureBuffer = Buffer.from(signature64, 'base64');


  // switch over jwsHeader.typ
  switch (jwsHeader.typ) {
    // 1. Verify jwsHeader.typ is 'iden3.sig.v0_1'
    case SIGV01:
      return {
        verified: verifySignedPacketV01(jwsHeader, jwsPayload, signatureBuffer),
        header: jwsHeader,
        payload: jwsPayload,
      };
    default:
      return undefined;
  }
}

function verifySignedPacketIdenAssert(signedPacket: string, nonceDB: NonceDB,
  origin: string): ?IdenAssertRes {
  const sigPackRes = verifySignedPacket(signedPacket);
  if (sigPackRes == null) {
    return undefined;
  }
  if (sigPackRes.verified === false) {
    return undefined;
  }
  if (sigPackRes.payload.type !== IDENASSERTV01) {
    return undefined;
  }
  const idenAssertRes = verifyIdenAssertV01(nonceDB, origin, sigPackRes.header, sigPackRes.payload);
  if (idenAssertRes == null) {
    return undefined;
  }
  return idenAssertRes;
}

function verifySignedPacketGeneric(signedPacket: string): ?{header: JwsHeader, payload: JwsPayload} {
  const res = verifySignedPacket(signedPacket);
  if (res == null) {
    return undefined;
  }
  if (res.verified === false) {
    return undefined;
  }
  if (res.payload.type !== GENERICSIGV01) {
    return undefined;
  }
  return { header: res.header, payload: res.payload };
}

module.exports = {
  newRequestIdenAssert,
  signPacket,
  signGenericSigV01,
  signIdenAssertV01,
  // signPacket,
  verifyIdenAssertV01,
  verifySignedPacket,
  verifySignedPacketGeneric,
  verifySignedPacketIdenAssert,
  SIGV01,
  IDENASSERTV01,
  SIGALGV01,
  GENERICSIGV01,
};
