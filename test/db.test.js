const chai = require('chai');
const {expect} = chai;
const iden3 = require('../index');

const testPrivKHex = '5ca155481bafd651f6297f525781430e737c3e64a7f854af5870897fa307ae65';

describe('[db] db.export db.import', () => {
  it('encrypt', () => {
    const db = new iden3.Db();
    const kc = new iden3.KeyContainer('localStorage', db);
    kc.unlock('pass');

    const passphrase = 'this is a test passphrase';
    kc.unlock(passphrase);
    const key0 = kc.importKey(testPrivKHex);

    db.insert("this is the key", "this is the value");

    const dbExported = db.exportLocalStorage(kc, key0, key0); // keyContainer, idaddr, ksign

    const db2 = new iden3.Db();
    db2.importLocalStorage(kc, dbExported);
    // expect(db).to.be.equal(db2);
  });
});
