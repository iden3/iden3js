const chai = require('chai');
const { expect } = chai;

const crypto = require('crypto');
const NonceDB = require('./nonceDB');

describe('[protocol] nonce', () => {
  it('nonce', () => {
    const nonceDB = new NonceDB();
    const date = new Date();
    let timeout = Math.round((date).getTime() / 1000);

    for (let i=0; i<10; i++) {
                // const randnonce = crypto.randomBytes(32).toString('base64');
	    	const randnonce = 'asdf' + i;
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

    for (let i=0; i<10; i++) {
                // const randnonce = crypto.randomBytes(32).toString('base64');
	    	const randnonce = 'asdf' + i;
	    	timeout++;
		nonceDB._add(randnonce, timeout);
    }

    expect(nonceDB.search('asdf3')).to.be.not.equal(undefined);
    expect(nonceDB.search('asdf30')).to.be.equal(undefined);
    expect(nonceDB.nonces.length).to.be.equal(10);
    nonceDB.deleteElem('asdf4');
    expect(nonceDB.nonces.length).to.be.equal(9);
    nonceDB.deleteOld(timeout-5);
    expect(nonceDB.nonces.length).to.be.equal(5);
    expect(nonceDB.search('asdf3')).to.be.equal(undefined);
  });
});
