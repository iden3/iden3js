// @flow

import { describe, it } from 'mocha';

const chai = require('chai');
const { bigInt } = require('snarkjs');
const eddsa = require('./eddsa-babyjub.js');
const utils = require('../utils');
const utilsBabyJub = require('./babyjub-utils.js');

const { expect } = chai;

describe('[eddsa babyjyb]', () => {
  const skHex = '0001020304050607080900010203040506070809000102030405060708090001';
  const sk = new eddsa.PrivateKey(utils.hexToBytes(skHex));

  const msgHex = '00010203040506070809';
  const msgBuff = utils.hexToBytes(msgHex);

  const msg = bigInt.leBuff2int(msgBuff);

  const pk = sk.public();
  const sig = sk.signMimc7(msg);

  it('pk.x', () => {
    expect(pk.p[0].toString()).to.be.equal('13277427435165878497778222415993513565335242147425444199013288855685581939618');
  });

  it('pk.y', () => {
    expect(pk.p[1].toString()).to.be.equal('13622229784656158136036771217484571176836296686641868549125388198837476602820');
  });

  it('sign', () => {
    // expect(.toString()).to.be.equal('');
    expect(sig.r8[0].toString()).to.be.equal('11384336176656855268977457483345535180380036354188103142384839473266348197733');
    expect(sig.r8[1].toString()).to.be.equal('15383486972088797283337779941324724402501462225528836549661220478783371668959');
    expect(sig.s.toString()).to.be.equal('2523202440825208709475937830811065542425109372212752003460238913256192595070');
  });

  it('verify', () => {
    expect(pk.verifyMimc7(msg, sig)).to.be.equal(true);
  });

  it('compress & decompress', () => {
    const sigComp = sig.compress();
    expect(sigComp.toString('hex')).to.be.equal(''
      + 'dfedb4315d3f2eb4de2d3c510d7a987dcab67089c8ace06308827bf5bcbe02a2'
      + '7ed40dab29bf993c928e789d007387998901a24913d44fddb64b1f21fc149405');
    const sig2 = eddsa.Signature.newFromCompressed(sigComp);
    expect(pk.verifyMimc7(msg, sig2)).to.be.equal(true);
  });

  it('scalar', () => {
    const privKeyBuff = utils.hexToBytes(skHex);
    const scalarPriv1 = utilsBabyJub.privToScalar(privKeyBuff);
    const scalarPriv2 = sk.toPrivScalar();
    expect(scalarPriv1.toString()).to.be.equal(scalarPriv2.toString());
  });
});
