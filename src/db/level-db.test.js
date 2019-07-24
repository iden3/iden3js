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

  it('Get database value', (done) => {
    const key = `key-${3}`;
    dataBase.get(key, (value) => {
      expect(value).to.be.equal(`value-${3}`);
      done();
    });
  });

  it('List keys', (done) => {
    dataBase.listKeys((keysList) => {
      const keys = [];
      for (let i = 0; i < 10; i++) {
        const key = `key-${i}`;
        keys.push(key);
      }
      expect(keysList).eql(keys);
      done();
    });
  });

  it('Clear single key', (done) => {
    const singleKey = 'key-3';
    dataBase.delete(singleKey, (del) => {
      if (del) {
        dataBase.get(singleKey, (value) => {
          expect(value).to.be.equal(null);
          done();
        });
      }
    });
  });

  it('Clear full database', (done) => {
    dataBase.deleteAll((del) => {
      if (del) {
        const key = `key-${6}`;
        dataBase.get(key, (value) => {
          expect(value).to.be.equal(null);
          done();
        });
      }
    });
  });

  after('Close', () => {
    dataBase.close();
    expect(dataBase.db._db.db.status).to.be.equal('closing' || 'closed');
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

  it('Export and import database', (done) => {
    dataBase.export((dbExpStr) => {
      expect(dbExpStr).to.be.not.equal(undefined);
      dataBase.deleteAll((del) => {
        if (del) {
          dataBase.import(dbExpStr, (imp) => {
            if (imp) {
              const key = `key-${6}`;
              dataBase.get(key, (value) => {
                expect(value).to.be.equal(`value-${6}`);
                done();
              });
            } else {
              expect(imp).to.be.equal(true);
              done();
            }
          });
        } else {
          expect(del).to.be.equal(true);
          done();
        }
      });
    });
  });

  after('Close', (done) => {
    dataBase.deleteAll((del) => {
      if (del) {
        dataBase.close();
        expect(dataBase.db._db.db.status).to.be.equal('closing' || 'closed');
        done();
      }
    });
  });
});
