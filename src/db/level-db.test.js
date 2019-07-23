const chai = require('chai');
const Db = require('./db');

const { expect } = chai;

describe('[level database]', () => {
  let dataBase;

  it('Create database and fill it', () => {
    dataBase = new Db.Level();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      dataBase.insert(key, value);
    }
  });

  it('Get database values', async () => {
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = await dataBase.get(key);
      expect(value).to.be.equal(`value-${i}`);
    }
  });

  it('List keys', async () => {
    const keysList = await dataBase.listKeys();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      expect(keysList[i]).to.be.equal(key);
    }
  });

  it('Clear single key', async () => {
    const singleKey = 'key-3';
    await dataBase.delete(singleKey);
    const value = await dataBase.get(singleKey);
    expect(value).to.be.equal(null);
  });

  it('Clear full database', async () => {
    await dataBase.deleteAll();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = await dataBase.get(key);
      expect(value).to.be.equal(null);
    }
  });

  after('Close database', async () => {
    await dataBase.close();
    expect(dataBase.db._db.db.status).to.be.equal('closing');
  });
});

describe('[Database] export and import database', () => {
  let dataBase;

  before('Create database and fill it', () => {
    dataBase = new Db.Level();
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      dataBase.insert(key, value);
    }
  });

  it('Export and import database', async () => {
    // Export wallet
    const ls = await dataBase.export();
    expect(ls).to.be.not.equal(undefined);
    // Import wallet
    // Delete LocalStorage
    await dataBase.deleteAll();
    const ack = await dataBase.import(ls);
    if (!ack) {
      throw new Error('Error importing database');
    }
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      const importValue = await dataBase.get(key);
      expect(importValue).to.be.equal(value);
    }
  });

  after('Close database', async () => {
    await dataBase.deleteAll();
    await dataBase.close();
    expect(dataBase.db._db.db.status).to.be.equal('closing');
  });
});
