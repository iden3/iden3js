// @flow

import { type NonceObj, NonceDB } from './nonceDB';
import { NameResolver } from '../api-client/name-resolver';
import { Discovery } from '../api-client/discovery';
import { Entry } from '../claim/entry/entry';

const bs58 = require('bs58');
const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');

const utils = require('../utils');
const claim = require('../claim/claim');
const proofs = require('./proofs');
// const NonceDB = require('./nonceDB');
const KeyContainer = require('../key-container/key-container');

// Constants of the login protocol
export const SIGV01 = 'iden3.sig.v0_1';
export const IDENASSERTV01 = 'iden3.iden_assert.v0_1';
export const GENERICSIGV01 = 'iden3.gen_sig.v0_1';
export const MSGV01 = 'iden3.msg.v0_1';
export const MSGPROOFCLAIMV01 = 'iden3.proofclaim.v0_1';
export const MSGTXT = 'txt';
export const SIGALGV01 = 'EK256K1';

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
export function newRequestIdenAssert(nonceDB: NonceDB, origin: string, deltatimeout: number): RequestIdenAssert {
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
export function signPacket(kc: KeyContainer, idAddr: string, ksign: string, proofKSign: proofs.ProofClaim,
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
  const signedObj = kc.sign(ksign, ethUtil.toBuffer(dataToSign));
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
export function signGenericSigV01(kc: KeyContainer, idAddr: string, ksign: string,
  proofKSign: proofs.ProofClaim, expirationTimeDelta: number, form: any): string {
  return signPacket(kc, idAddr, ksign, proofKSign, expirationTimeDelta, GENERICSIGV01, {}, form);
}

export type IdenAssertProofName = {
  ethName: string,
  proofAssignName: proofs.ProofClaim,
};


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
export function signIdenAssertV01(signatureRequest: any, idAddr: string,
  proofName: ?IdenAssertProofName, kc: KeyContainer, ksign: string,
  proofKSign: proofs.ProofClaim, expirationTimeDelta: number): string {
  if (proofName === undefined) {
    proofName = null;
  }
  return signPacket(kc, idAddr, ksign, proofKSign, expirationTimeDelta,
    IDENASSERTV01, signatureRequest.body.data, proofName);
}

export type IdenAssertRes = {
  nonceObj: NonceObj,
  ethName: string,
  idAddr: string,
};

/**
 * Generate and sign signature packet of type identity assertion
 * @param {String} idAddr
 * @param {Object} kc
 * @param {String} ksign - public key in hex format
 * @param {Object} proofKSign
 * @param {Number} expirationTimeDelta
 * @param {String} msgType - type of message
 * @param {Object} msg - message object
 * @returns {String} signedPacket
 */
export function signMsgV01(idAddr: string,
  kc: KeyContainer, ksign: string, proofKSign: proofs.ProofClaim,
  expirationTimeDelta: number, msgType: string, msg: any): string {
  return signPacket(kc, idAddr, ksign, proofKSign, expirationTimeDelta,
    MSGV01, null, { type: msgType, data: msg });
}

/**
 * Class representing a signedpacket verifier
 */
export class SignedPacketVerifier {
  discovery: Discovery;
  nameResolver: NameResolver;

  /**
   * Initialization SignedPacketVerifier
   * @param {Discovery} discovery
   * @param {NameResolver} nameResolver
   */
  constructor(discovery: Discovery, nameResolver: NameResolver) {
    this.discovery = discovery;
    this.nameResolver = nameResolver;
  }

  /**
   * Verify an identity assertio v0.1 signed packet
   * @param {Object} nonceDB
   * @param {String} origin
   * @param {Object} jwsHeader
   * @param {Object} jwsPayload
   * @param {Buffer} signatureBuffer
   * @returns {Object} IdenAssertRes - If verification fails, `undefined` is returned
   */
  verifyIdenAssertV01(nonceDB: NonceDB, origin: string,
    jwsHeader: JwsHeader, jwsPayload: JwsPayload): ?IdenAssertRes {
    // TODO AFTER MILESTONE check data structure scheme

    // 2. Verify jwsPayload.data.origin is origin
    if (jwsPayload.data.origin !== origin) {
      throw new Error('payload.data.origin != origin');
    }

    // 3. Verify jwsPayload.data.challenge is in nonceDB and hasn't expired, delete it
    const nonceResult = nonceDB.searchAndDelete(jwsPayload.data.challenge);
    if (nonceResult == null) {
      throw new Error('Challenge nonce not found in the DB');
    }

    // check that jwsPayload.proofKSign.proofs.length <= 2
    if (jwsPayload.proofKSign.proofs.length > 2) {
      throw new Error('length of payload.proofKSign.proof > 2');
    }

    if (jwsPayload.form == null) {
      return {
        nonceObj: nonceResult.nonceObj,
        ethName: '',
        idAddr: jwsHeader.iss,
      };
    }

    // 4. Verify that jwsHeader.iss and jwsPayload.form.ethName are in jwsPayload.proofAssignName.leaf
    const entry = Entry.newFromHex(jwsPayload.form.proofAssignName.leaf);
    const claimAssignName = claim.newClaimFromEntry(entry);
    if (!(claimAssignName instanceof claim.AssignName)) {
      throw new Error('payload.form.proofAssignName is not an assign name claim');
    }
    // const nameWithoutDomain = jwsPayload.form.ethName.split('@')[0];
    // check jwsPayload.form.proofAssignName.leaf {hashName} === hash(jwsPayload.form.ethName
    if (utils.bytesToHex(claimAssignName.hashName) !== utils.bytesToHex(utils.hashBytes(jwsPayload.form.ethName).slice(1, 32))) {
      throw new Error('hash(payload.form.ethName) != payload.form.proofAssignName.structure.hashName');
    }
    // check claimAssignName.structure.id = jwsHeader.iss
    if (bs58.encode(claimAssignName.id) !== jwsHeader.iss) {
      throw new Error('claimAssignName.structure.id != header.iss');
    }

    // TODO AFTER MILESTONE verify identity address from counterfactual
    // TODO AFTER MILESTONE check counterfactual address from jwsPayload.identity, address == jwsHeader.iss
    // TODO AFTER MILESTONE check jwsPayload.identity.relay == hardcoded relay address

    // 5a. Extract domain from the name
    const idx = jwsPayload.form.ethName.indexOf('@');
    if (idx === -1) {
      throw new Error('No @ in the name');
    }
    const domain = jwsPayload.form.ethName.substring(idx + 1);

    // 5b. Resolve name to obtain name server idAddr and verify that it matches the signer idAddr
    if (jwsPayload.form.proofAssignName.proofs.length !== 1) {
      throw new Error('length of payload.form.proofKSign != 1');
    }
    const nameServerIdAddr = this.nameResolver.resolve(domain);
    if (nameServerIdAddr == null) {
      throw new Error('Can\'t resolve domain');
    }
    const signerIdAddr = jwsPayload.form.proofAssignName.signer;
    if (nameServerIdAddr !== signerIdAddr) {
      throw new Error('Resolved name server id doesn\'t match payload.form.proofAssignName.signer');
    }

    // 5c. Get the operational key from the signer (name server).
    const signer = this.discovery.getEntity(signerIdAddr);
    if (signer == null) {
      throw new Error('Can\'t get the operational public key of the name server');
    }

    // 5d. VerifyProofClaim(jwsPayload.form.proofAssignName, signerOperational)
    if (!proofs.verifyProofClaim(jwsPayload.form.proofAssignName, signer.kOpAddr)) {
      throw new Error('verify proof claim of payload.form.proofAssignName failed');
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
  verifySignedPacketV01(jwsHeader: JwsHeader, jwsPayload: JwsPayload,
    signatureBuffer: Buffer): boolean {
    // 2. Verify jwsHeader.alg is 'ES255'
    if (jwsHeader.alg !== SIGALGV01) {
      throw new Error(`Unsupported alg: ${jwsHeader.alg}`);
    }

    // 3. Verify that jwsHeader.iat <= now() < jwsHeader.exp
    const date = new Date();
    const current = Math.round((date).getTime() / 1000);
    // Moving iat 2 minutes in the past to accomodate time shifts in time synchronization.
    if (!((jwsHeader.iat - 120 <= current) && (current < jwsHeader.exp))) {
      throw new Error(`Signature not valid for current date (iat:${jwsHeader.iat} - 120, now:${current}, exp:${jwsHeader.exp})`);
    }

    // 4. Verify that jwsPayload.ksign is in jwsPayload.proofKSign.leaf
    const entry = Entry.newFromHex(jwsPayload.proofKSign.leaf);
    const claimAuthorizeKSign = claim.newClaimFromEntry(entry);
    if (!(claimAuthorizeKSign instanceof claim.AuthorizeKSignSecp256k1)) {
      throw new Error('jwsPayload.proofKSign.leaf is not a claim.AuthorizeKSignSecp256k1');
    }
    const pubK = claimAuthorizeKSign.pubKeyCompressed;
    const pubKHex = utils.bytesToHex(pubK);
    if (pubKHex !== jwsPayload.ksign) {
      throw new Error('Pub key in payload.proofksign doesn\'t match payload.ksign');
    }

    // X. check that 1 <= jwsPayload.proofKSign.proofs.length <= 2
    if (jwsPayload.proofKSign.proofs.length < 1) {
      throw new Error('No proofs found in payload.proofKSign');
    }
    if (jwsPayload.proofKSign.proofs.length > 2) {
      throw new Error('Authorize KSign claim proofs of depth > 2 not allowed yet');
    }

    if (jwsPayload.proofKSign.proofs.length > 1) {
      // 5. Verify that jwsHeader.iss is in jwsPayload.proofKSign.
      if (jwsPayload.proofKSign.proofs[0].aux == null) {
        throw new Error('payload.proofksign.proofs[0].aux is nil');
      }
      if (jwsHeader.iss !== jwsPayload.proofKSign.proofs[0].aux.idAddr) {
        throw new Error('header.iss doesn\'t match with idaddr in proofksign set root claim');
      }
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
      throw new Error('JWS signature doesn\'t match with pub key in payload.ksign');
    }

    // 7a. Get the operational key from the signer and in case it's a relay,
    // check if it's trusted.
    const signerIdAddr = jwsPayload.proofKSign.signer;
    const signer = this.discovery.getEntity(signerIdAddr);
    if (signer == null) {
      throw new Error('Unable to get payload.proofksign.signer entity data');
    }
    if (jwsPayload.proofKSign.proofs.length > 1) {
      if (!signer.trusted.relay) {
        throw new Error('payload.proofksign.signer is not a trusted relay');
      }
    }

    // NOTE: For now we accept self signed auth ksign claims (the signer has
    // the claim in its own merkle tree) as long as the signer identity
    // details are found via the discovery, which we considered trusted for
    // now.  In the future the claims will be verified by checking the proof
    // from the entry to the root of a tree that's on the
    // blockchain, so no signature verification will be necessary and signing
    // entities won't be able to sign contradicting claims.

    // 7b. VerifyProofClaim(jwsPayload.proofOfKSign, signerOperational)
    if (!proofs.verifyProofClaim(jwsPayload.proofKSign, signer.kOpAddr)) {
      throw new Error('Invalid proofKSign');
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
  verifySignedPacket(signedPacket: string): { verified: boolean, header: JwsHeader, payload: JwsPayload } {
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
          verified: this.verifySignedPacketV01(jwsHeader, jwsPayload, signatureBuffer),
          header: jwsHeader,
          payload: jwsPayload,
        };
      default:
        throw new Error(`Unsupported signature packet typ: ${jwsHeader.typ}`);
    }
  }

  verifySignedPacketIdenAssert(signedPacket: string, nonceDB: NonceDB,
    origin: string): ?IdenAssertRes {
    const sigPackRes = this.verifySignedPacket(signedPacket);
    if (sigPackRes.verified === false) {
      return undefined;
    }
    if (sigPackRes.payload.type !== IDENASSERTV01) {
      throw new Error(`payload type is not ${IDENASSERTV01}`);
    }
    const idenAssertRes = this.verifyIdenAssertV01(nonceDB, origin, sigPackRes.header, sigPackRes.payload);
    if (idenAssertRes == null) {
      throw new Error('verifyIdenAssertV01 failed');
    }
    return idenAssertRes;
  }

  verifySignedPacketBase(signedPacket: string, payloadType: string): ?{header: JwsHeader, payload: JwsPayload} {
    const res = this.verifySignedPacket(signedPacket);
    if (res == null) {
      return undefined;
    }
    if (res.verified === false) {
      return undefined;
    }
    if (res.payload.type !== payloadType) {
      return undefined;
    }
    return { header: res.header, payload: res.payload };
  }

  verifySignedPacketGeneric(signedPacket: string): ?{header: JwsHeader, payload: JwsPayload} {
    return this.verifySignedPacketBase(signedPacket, GENERICSIGV01);
  }

  verifySignedPacketMessage(signedPacket: string): ?{header: JwsHeader, payload: JwsPayload} {
    return this.verifySignedPacketBase(signedPacket, MSGV01);
  }
}
