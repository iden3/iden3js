// @flow
import { describe, it } from 'mocha';

const chai = require('chai');
const babyUtils = require('./babyjub-utils.js');
const utils = require('../utils');

const { expect } = chai;

describe('[bayjub utils]', () => {
  const privKey = '0x79156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKey);
  it('Generate public key uncompressed', () => {
    const pubKey = babyUtils.privToPub(privKeyBuff, false);
    expect(utils.bytesToHex(pubKey)).to.be.equal('0x19936f779eea3fe7a7b79664291199850b0f66bbf16b7716fb19421e540ddfae'
                                                 + '104c1db0b44218998bbccf79de02005cfa0a68c2033e4461f4894bdae81bddef');
  });
  it('Generate public key compressed', () => {
    const pubKeyCompressed = babyUtils.privToPub(privKeyBuff, true);
    expect(utils.bytesToHex(pubKeyCompressed)).to.be.equal('0xefdd1be8da4b89f461443e03c2680afa5c0002de79cfbc8b991842b4b01d4c90');
  });
});
