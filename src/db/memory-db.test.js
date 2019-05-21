const chai = require('chai');
const Db = require('./db');
const CONSTANTS = require('../constants');

const { expect } = chai;

describe('[memory database]', () => {
  let dataBase;

  it('Check prefix', () => {
    const dataBaseNoPrefix = new Db.Memory(false);
    expect(dataBaseNoPrefix.prefix).to.be.equal('');
    const dataBasePrefix = new Db.Memory(true);
    expect(dataBasePrefix.prefix).to.be.equal(CONSTANTS.DBPREFIX);
  });

  it('Create database and fill it', () => {
    dataBase = new Db.Memory();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      dataBase.insert(key, value);
    }
  });

  it('Get database values', () => {
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = dataBase.get(key);
      expect(value).to.be.equal(`value-${i}`);
    }
  });

  it('Clear single key', () => {
    const singleKey = 'key-3';
    dataBase.delete(singleKey);
    const value = dataBase.get(singleKey);
    expect(value).to.be.equal(null);
  });

  it('Clear full database', () => {
    dataBase.deleteAll();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = dataBase.get(key);
      expect(value).to.be.equal(null);
    }
  });
});
