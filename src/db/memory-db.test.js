const chai = require('chai');
const Db = require('./db');

const { expect } = chai;

describe('[memory database]', () => {
  let dataBase;

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

  it('List keys', () => {
    const keysList = dataBase.listKeys('');
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      expect(keysList[i]).to.be.equal(key);
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

describe('[Database] export and import database', () => {
  let dataBase;

  before('Create database and fill it', () => {
    dataBase = new Db.Memory();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      dataBase.insert(key, value);
    }
  });

  it('Export and import database', () => {
    // Export wallet
    const ls = dataBase.export();
    expect(ls).to.be.not.equal(undefined);
    // Import wallet
    // Delete LocalStorage
    dataBase.deleteAll();
    const ack = dataBase.import(ls);
    if (!ack) {
      throw new Error('Error importing database');
    }
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      const importValue = dataBase.get(key);
      expect(importValue).to.be.equal(value);
    }
  });
});
