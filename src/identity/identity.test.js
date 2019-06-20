const chai = require('chai');
const Db = require('../db/db');
const iden3 = require('../index.js');

const { expect } = chai;

const passphrase = 'pass';

describe('[identity]', () => {
  let db0;
  let db1;
  before('create dbs', () => {
    db0 = new Db.LocalStorage('db0');
    db1 = new Db.LocalStorage('db1');
  });
  it('Generate random identity', () => {
    const identity = iden3.Identity.create(db0, passphrase);
    const idBuff = iden3.identityUtils.idFromString(identity.id);
    expect(iden3.identityUtils.checkChecksum(idBuff)).to.be.equal(true);
    expect(iden3.identityUtils.stringFromBufferId(idBuff)).to.be.equal(identity.id);
    identity.keyContainer.lock();
  });
  it('Generate identity', () => {
    const seed = 'walk gravity scout labor eight usual blame warm unlock crane private rival';
    const identity = iden3.Identity.create(db1, passphrase, seed);
    expect(identity.id).to.be.equal('119RZPuT7uWDs6u7ZhzxkHBnuKimY7ABCYGuobcZTj');
    expect(identity.keyOperationalPub).to.be.equal('d2b4b4fd17a23d6ba02bcf5f4c6003ac3e2dfe9e9b7af71d6ffeb88f700c372a');
    expect(identity.keyDisable).to.be.equal('0x6a5bf2b3fe6fff9ec56eba2873a42dea037b5595');
    expect(identity.keyReenable).to.be.equal('0xf2996bf50d4bda42c966d51118bd01cab655a0a1');

    expect(iden3.identityUtils.checkChecksum(iden3.identityUtils.idFromString('119RZPuT7uWDs6u7ZhzxkHBnuKimY7ABCYGuobcZTj'))).to.be.equal(true);
    const idBuff = iden3.identityUtils.idFromString(identity.id);
    expect(iden3.identityUtils.checkChecksum(idBuff)).to.be.equal(true);
    identity.keyContainer.lock();
  });
  it('Load identity', () => {
    const identity = iden3.Identity.load(db1, '119RZPuT7uWDs6u7ZhzxkHBnuKimY7ABCYGuobcZTj');

    expect(identity.id).to.be.equal('119RZPuT7uWDs6u7ZhzxkHBnuKimY7ABCYGuobcZTj');
    expect(identity.keyOperationalPub).to.be.equal('d2b4b4fd17a23d6ba02bcf5f4c6003ac3e2dfe9e9b7af71d6ffeb88f700c372a');
    expect(identity.keyDisable).to.be.equal('0x6a5bf2b3fe6fff9ec56eba2873a42dea037b5595');
    expect(identity.keyReenable).to.be.equal('0xf2996bf50d4bda42c966d51118bd01cab655a0a1');

    identity.keyContainer.lock();
  });
  it('Load non existing identity in db', () => {
    // as we are trying to get an id that is not in the db0, should return an error
    expect(() => iden3.identity.load(db0, '11eEdfGdcw6CuSEaF5StaZPP6iEA9DoqXdbhh6wAo')).to.throw(Error);
  });
});
