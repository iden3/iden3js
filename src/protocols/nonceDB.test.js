// @flow
import { describe, it } from 'mocha';
import { NonceDB, type NonceResult } from './nonceDB';

const chai = require('chai');

const { expect, assert } = chai;

// const crypto = require('crypto');

describe('[protocol] nonce', () => {
  it('nonce', () => {
    const nonceDB = new NonceDB();
    // const date = new Date();
    // let timeout = Math.round((date).getTime() / 1000);

    for (let i = 0; i < 10; i++) {
      // const randnonce = crypto.randomBytes(32).toString('base64');
      const randnonce = `asdf${i}`;
      nonceDB.add(randnonce, 5);
    }

    expect(nonceDB.search('asdf3')).to.be.not.equal(undefined);
    expect(nonceDB.search('asdf30')).to.be.equal(undefined);
    expect(nonceDB.nonces.length).to.be.equal(10);
    nonceDB.deleteElem('asdf4');
    expect(nonceDB.nonces.length).to.be.equal(9);
  });
  it('nonce timestamps', () => {
    const nonceDB = new NonceDB();
    const date = new Date();
    let timeout = Math.round((date).getTime() / 1000);

    for (let i = 0; i < 10; i++) {
      // const randnonce = crypto.randomBytes(32).toString('base64');
      const randnonce = `asdf${i}`;
      timeout += 1;
      nonceDB._add(randnonce, timeout);
    }

    expect(nonceDB.search('asdf3')).to.be.not.equal(undefined);
    expect(nonceDB.search('asdf30')).to.be.equal(undefined);
    expect(nonceDB.nonces.length).to.be.equal(10);
    nonceDB.deleteElem('asdf4');
    expect(nonceDB.nonces.length).to.be.equal(9);
    nonceDB.deleteOld(timeout - 5);
    expect(nonceDB.nonces.length).to.be.equal(5);
    expect(nonceDB.search('asdf3')).to.be.equal(undefined);
  });
  it('nonce aux', () => {
    const nonceDB = new NonceDB();

    nonceDB.add('asdf0', 1000);
    nonceDB.add('asdf1', 1000);
    expect(nonceDB.search('asdf0')).to.be.not.equal(undefined);
    expect(nonceDB.addAuxToNonce('asdf0', {
      param1: 1,
      param2: 2,
    })).to.be.equal(true);
    // check that one aux can be added only one time in a nonce in the nonceDB
    expect(nonceDB.addAuxToNonce('asdf0', {
      param1: 1,
      param2: 2,
    })).to.be.equal(false);
    expect(nonceDB.addAuxToNonce('asdf0', 'auxdata')).to.be.equal(false);
    expect(nonceDB.addAuxToNonce('asdf1', {
      param1: 1,
      param2: 2,
    })).to.be.equal(true);
    const result = (nonceDB.search('asdf0'): any); // This is a type casting
    expect(result).to.not.be.equal(undefined);
    expect(result.nonce.aux.param1).to.be.equal(1);
  });
  it('nonce searchAndDelete', () => {
    const nonceDB = new NonceDB();

    nonceDB.add('asdf3', 1000);
    nonceDB.addAuxToNonce('asdf3', {
      param1: 1,
      param2: 2,
    });
    const result = (nonceDB.searchAndDelete('asdf3'): any);
    expect(result).to.not.be.equal(undefined);
    expect(result.nonce.aux.param1).to.be.equal(1);
  });
});
