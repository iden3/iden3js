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
const SIGALGV01 = 'ES255';

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
 * Sign signatureRequest
 * @param {Object} signatureRequest
 * @param {String} idAddr
 * @param {String} ethName
 * @param {Object} proofEthName
 * @param {Object} kc
 * @param {String} ksign - public key in hex format
 * @param {Object} proofKSign
 * @param {Number} expirationTime
 * @returns {String} signedPacket
 */
function signIdenAssertV01(signatureRequest: any, idAddr: string,
  ethName: string, proofAssignName: proofs.ProofClaim, kc: kCont.KeyContainer, ksign: string,
  proofKSign: proofs.ProofClaim, expirationTime: number): string {
  const date = new Date();
  const currentTime = Math.round((date).getTime() / 1000);
  const jwsHeader = {
    typ: SIGV01,
    iss: idAddr,
    iat: currentTime,
    exp: expirationTime,
    alg: SIGALGV01,
  };
  const jwsPayload = {
    type: IDENASSERTV01,
    data: signatureRequest.body.data,
    ksign,
    proofKSign,
    form: {
      ethName,
      proofAssignName,
    },
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

export type NonceVerified = {
  nonce: NonceObj,
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
 * @returns {Object} nonce
 */
function verifyIdenAssertV01(nonceDB: NonceDB, origin: string,
  jwsHeader: JwsHeader, jwsPayload: JwsPayload): ?NonceVerified {
  // TODO AFTER MILESTONE check data structure scheme

  // 2. Verify jwsPayload.data.origin is origin
  if (jwsPayload.data.origin !== origin) {
    return undefined;
  }

  // 3. Verify jwsPayload.data.challenge is in nonceDB and hasn't expired, delete it
  const nonceVerified = nonceDB.searchAndDelete(jwsPayload.data.challenge);
  if (nonceVerified == null) {
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
  const nameWithoutDomain = jwsPayload.form.ethName.split('@')[0];
  // check jwsPayload.form.proofAssignName.leaf {hashName} === hash(jwsPayload.form.ethName
  if (utils.bytesToHex(claimAssignName.hashName) !== utils.bytesToHex(utils.hashBytes(nameWithoutDomain).slice(1, 32))) {
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

  // nonceVerified.nonce.ethName = jwsPayload.form.ethName;
  // nonceVerified.nonce.idAddr = jwsHeader.iss;
  return {
    nonce: nonceVerified.nonce,
    ethName: jwsPayload.form.ethName,
    idAddr: jwsHeader.iss,
  };
}

/**
 * Verify a signed packet
 * @param {Object} nonceDB
 * @param {String} origin
 * @param {Object} jwsHeader
 * @param {Object} jwsPayload
 * @param {Buffer} signatureBuffer
 * @returns {?NonceVerified} nonce
 */
function verifySignedPacketV01(nonceDB: NonceDB, origin: string, jwsHeader: JwsHeader, jwsPayload: JwsPayload,
  signatureBuffer: Buffer): ?NonceVerified {
  // 2. Verify jwsHeader.alg is 'ES255'
  if (jwsHeader.alg !== SIGALGV01) {
    return undefined;
  }

  // 3. Verify that jwsHeader.iat <= now() < jwsHeader.exp
  const date = new Date();
  const current = Math.round((date).getTime() / 1000);
  if (!((jwsHeader.iat <= current) && (current < jwsHeader.exp))) {
    return undefined;
  }

  // 4. Verify that jwsPayload.ksign is in jwsPayload.proofKSign.leaf
  const entry = Entry.newFromHex(jwsPayload.proofKSign.leaf);
  const claimAuthorizeKSign = claimUtils.newClaimFromEntry(entry);
  if (!(claimAuthorizeKSign instanceof AuthorizeKSignSecp256k1)) {
    return undefined;
  }
  const pubK = claimAuthorizeKSign.pubKeyCompressed;
  const pubKHex = utils.bytesToHex(pubK);
  if (pubKHex !== jwsPayload.ksign) {
    return undefined;
  }

  // 5. Verify that jwsHeader.iss is in jwsPayload.proofKSign.
  if (jwsPayload.proofKSign.proofs[0].aux == null) {
    return undefined;
  }
  if (jwsHeader.iss !== jwsPayload.proofKSign.proofs[0].aux.idAddr) {
    return undefined;
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
    return undefined;
  }

  // 7. VerifyProofOfClaim(jwsPayload.proofOfKSign, relayPk)
  if (!proofs.verifyProofClaim(jwsPayload.proofKSign, relayAddr)) {
    return undefined;
  }

  switch (jwsPayload.type) {
    case IDENASSERTV01:
      return verifyIdenAssertV01(nonceDB, origin, jwsHeader, jwsPayload);
    default:
      return undefined;
  }
}

/**
 * Verify a signed packet
 * @param {Object} nonceDB
 * @param {String} origin
 * @param {String} signedPacket
 * @returns {Object} nonce
 */
function verifySignedPacket(nonceDB: NonceDB, origin: string, signedPacket: string): ?NonceVerified {
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
      return verifySignedPacketV01(nonceDB, origin, jwsHeader, jwsPayload, signatureBuffer);
    default:
      return undefined;
  }
}

module.exports = {
  newRequestIdenAssert,
  signIdenAssertV01,
  // signPacket,
  verifyIdenAssertV01,
  verifySignedPacket,
};
