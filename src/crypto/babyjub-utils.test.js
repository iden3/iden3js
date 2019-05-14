// @flow
import { describe, it } from 'mocha';

const chai = require('chai');
const babyUtils = require('./babyjub-utils.js');
const utils = require('../utils');

const { expect } = chai;

describe('[bayjub utils]', () => {
  const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKey);

  it('Generate public key uncompressed', () => {
    const pubKey = babyUtils.privToPub(privKeyBuff, false);
    expect(utils.bytesToHex(pubKey)).to.be.equal('0x1fbd916441cc6f6299b3078dcbc00c476a520db3619f8eb58e41b27baed97e4d'
                                                 + '2b05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c');
  });

  it('Generate public key compressed', () => {
    const pubKeyCompressed = babyUtils.privToPub(privKeyBuff, true);
    expect(utils.bytesToHex(pubKeyCompressed)).to.be.equal('0xab05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c');
  });

  it('Generate public key from private key different than 32 bytes', () => {
    const privKey31 = Buffer.alloc(31).fill('A');
    const privKey33 = Buffer.alloc(33).fill('B');
    expect(() => { babyUtils.privToPub(privKey31, true); }).to.throw('Input Error: Buffer has 31 bytes. It should be 32 bytes');
    expect(() => { babyUtils.privToPub(privKey33, true); }).to.throw('Input Error: Buffer has 33 bytes. It should be 32 bytes');
  });

  it('Generate random private key, retrieve public', () => {
    const randPrivKeyHex = babyUtils.genPriv();
    const randPrivKeyBuff = utils.hexToBytes(randPrivKeyHex);
    expect(() => { babyUtils.privToPub(randPrivKeyBuff, true); }).not.to.throw();
  });
});
