const crypto = require('crypto');

const ethUtil = require('ethereumjs-util');
const { secp256k1 } = ethUtil;

const utils = require('../utils');
const claim = require('../claim/claim');
const claimUtils = require('../claim/claim-utils');
const CONSTANTS = require('../constants'); // iden3 constants
const Entry = require('../claim/entry/entry');
const proofs = require('./proofs');
const mtHelpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const smt = require('../sparse-merkle-tree/sparse-merkle-tree');

// Constants of the login protocol
const SIGV01 = 'iden3.sig.v0_1';
const IDENASSERTV01 = 'iden3.iden_assert.v0_1';
const SIGALGV01 = 'ES255';
const NONCEDELTATIMEOUT = 2 * 60; // two minutes

/**
* New RequestIdenAssert
* for login purposes
* @param {String} origin
* @param {String} sessionId
* @param {Number} timeout
* @returns {Object} requestIdenAssert
*/
const newRequestIdenAssert = function newRequestIdenAssert(nonceDB, origin, sessionId, deltatimeout) {
  const nonce = crypto.randomBytes(32).toString('base64');
  const nonceObj = nonceDB.add(nonce, deltatimeout);
  return {
    header: {
      typ: SIGV01
    },
    body: {
      type: IDENASSERTV01,
      data: {
        challenge: nonce,
        timeout: nonceObj.timestamp,
        origin: origin,
        sessionId: sessionId
      }
    }
  };
};

/*
// TODO AFTER MILESTONE
const signPacket = function signPacket(signatureRequest, usrAddr, kc, ksign, proofOfKSign) {
  let result = {};
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
    proofOfKSign: proofOfKSign,
    form: {
      ethName: ethName,
      proofOfEthName: proofOfEthName,
    },
    // identity: { // TODO AFTER MILESTONE
    //   operational: ,
    //   recovery:,
    //   revoke:,
    //   relayer:,
    //   impl:,
    // }
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
 * @param {Object} jwsHeader
 * @param {Object} jwsPayload
 * @param {Buffer} signatureBuffer
 */
const verifyIdenAssertV01 = function verifyIdenAssertV01(nonceDB, jwsHeader, jwsPayload, signatureBuffer) {
  // TODO AFTER MILESTONE check data structure scheme

  // check if jwsHeader.alg is iden3.sig.v0_1 (SIGALGV01)
  if (jwsHeader.alg !== SIGALGV01) {
    return false;
  }

  // check jwsPayload.data.challege valid
  if (!nonceDB.searchAndDelete(jwsPayload.data.challenge)) {
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
    return false;
  }

  // check jwsPayload.ksign with jwsPayload.proofOfKSign.Leaf
  // get ClaimAuthorizeKSign from jwsPayload.proofOfKSign.leaf
  let entry = new Entry();
  entry.fromHexadecimal(jwsPayload.proofOfKSign.leaf);
  const claimAuthorizeKSign = claimUtils.newClaimFromEntry(entry);
  const pubK = claimAuthorizeKSign.structure.pubKeyCompressed;
  const addr = ethUtil.pubToAddress(pubK, true);
  const addrHex = utils.bytesToHex(addr);
  if (addrHex!==jwsPayload.ksign) {
 	return false; 
  }

  // check that jwsPayload.form.proofOfEthName == jwsPayload.form.ethName == jwsHeader.iss
  // get ClaimAssignName from jwsPayload.form.proofOfEthName.leaf
  entry = new Entry();
  entry.fromHexadecimal(jwsPayload.form.proofOfEthName.proofOfClaimAssignName.leaf);
  const claimAssignName = claimUtils.newClaimFromEntry(entry);
  const nameWithoutDomain = jwsPayload.form.proofOfEthName.name.split("@")[0];
  const hashName = utils.hashBytes(nameWithoutDomain);
  // check jwsPayload.form.proofOfEthName.proofOfClaimAssignName.leaf {hashName} === hash(jwsPayload.form.proofOfEthName.name
  if (utils.bytesToHex(claimAssignName.structure.hashName)!==utils.bytesToHex(utils.hashBytes(nameWithoutDomain).slice(1, 32))) {
    return false; 
  }
  // check claimAssignName.structure.id = jwsHeader.iss
  if (utils.bytesToHex(claimAssignName.structure.id)!==jwsHeader.iss) {
    return false;
  }
  

  // check verify signature with jwsPayload.ksign
  // as verifying a signature is cheaper than verifying a merkle tree proof, first we verify signature with ksign
  const header64 = Buffer.from(JSON.stringify(jwsHeader)).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(jwsPayload)).toString('base64');
  const dataSigned = header64 + '.' + payload64;
  const message = ethUtil.toBuffer(dataSigned);
  const msgHash = ethUtil.hashPersonalMessage(message);
  const sigHex = utils.bytesToHex(signatureBuffer);
  if (!utils.verifySignature(utils.bytesToHex(msgHash), sigHex, jwsPayload.ksign)) { // mHex, sigHex, addressHex
    return false;
  }


  // TODO AFTER MILESTONE verify identity address from counterfactual
  // TODO AFTER MILESTONE check counterfactual address from jwsPayload.identity, address == jwsHeader.iss
  // TODO AFTER MILESTONE check jwsPayload.identity.relay == hardcoded relay address


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
 * @param {String} signedPacket
 */
const verifySignedPacket = function verifySignedPacket(nonceDB, signedPacket) {
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
      verified = verifyIdenAssertV01(nonceDB, jwsHeader, jwsPayload, signatureBuffer);
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

