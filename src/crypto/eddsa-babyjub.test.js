// @flow

import { describe, it } from 'mocha';

const chai = require('chai');
const { bigInt } = require('snarkjs');
const eddsa = require('./eddsa-babyjub.js');
const utils = require('../utils');

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
    expect(pk.p[0].toString()).to.be.equal('2610057752638682202795145288373380503107623443963127956230801721756904484787');
  });

  it('pk.y', () => {
    expect(pk.p[1].toString()).to.be.equal('16617171478497210597712478520507818259149717466230047843969353176573634386897');
  });

  it('sign', () => {
    // expect(.toString()).to.be.equal('');
    expect(sig.r8[0].toString()).to.be.equal('4974729414807584049518234760796200867685098748448054182902488636762478901554');
    expect(sig.r8[1].toString()).to.be.equal('18714049394522540751536514815950425694461287643205706667341348804546050128733');
    expect(sig.s.toString()).to.be.equal('2171284143457722024136077617757713039502332290425057126942676527240038689549');
  });

  it('verify', () => {
    expect(pk.verifyMimc7(msg, sig)).to.be.equal(true);
  });

  it('compress & decompress', () => {
    const sigComp = sig.compress();
    expect(sigComp.toString('hex')).to.be.equal(''
      + '5dfb6f843c023fe3e52548ccf22e55c81b426f7af81b4f51f7152f2fcfc65f29'
      + '0dab19c5a0a75973cd75a54780de0c3a41ede6f57396fe99b5307fff3ce7cc04');
    const sig2 = eddsa.Signature.newFromCompressed(sigComp);
    expect(pk.verifyMimc7(msg, sig2)).to.be.equal(true);
  });
});
