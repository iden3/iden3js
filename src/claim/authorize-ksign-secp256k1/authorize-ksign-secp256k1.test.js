// @flow
import { describe, it, before } from 'mocha';

const chai = require('chai');
const ethUtil = require('ethereumjs-util');
const authorizeKSignSecp256k1 = require('./authorize-ksign-secp256k1');
const utils = require('../../utils');

const { secp256k1 } = ethUtil;
const { expect } = chai;

describe('[Claim Authorize KSignSecp256k1]', () => {
  let entryClaim;
  let parsedClaim;
  const versionExample = 1;
  const privKeyHex = '0x79156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKeyHex);
  const pubKeyCompressedExample = secp256k1.publicKeyCreate(privKeyBuff, true);
  let claimAuthKSignSecp256k1;

  before('Create new authorizeKSignSecp256k1 claim', () => {
    claimAuthKSignSecp256k1 = authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.new(versionExample,
      utils.bytesToHex(pubKeyCompressedExample));
    expect(claimAuthKSignSecp256k1).to.not.be.equal(null);
    entryClaim = claimAuthKSignSecp256k1.toEntry();
    parsedClaim = authorizeKSignSecp256k1.AuthorizeKSignSecp256k1.newFromEntry(entryClaim);
  });

  it('Check public key compressed', () => {
    expect(utils.bytesToHex(pubKeyCompressedExample)).to.be.equal('0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
  });

  it('Parse claim type', () => {
    expect(utils.bytesToHex(claimAuthKSignSecp256k1.claimType)).to.be.equal(utils.bytesToHex(parsedClaim.claimType));
  });
  it('Parse version', () => {
    expect(utils.bytesToHex(claimAuthKSignSecp256k1.version)).to.be.equal(utils.bytesToHex(parsedClaim.version));
  });
  it('Parse public key compressed', () => {
    expect(utils.bytesToHex(claimAuthKSignSecp256k1.pubKeyCompressed)).to.be.equal(utils.bytesToHex(parsedClaim.pubKeyCompressed));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                                       + '0000000000000000000000000000000000004d59000000010000000000000004');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2f04e25bb5c9e01946aca5c80307d73bace3c3f1496175451db4495dd5a6c423';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});
