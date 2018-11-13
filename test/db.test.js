const chai = require('chai');
const {expect} = chai;
const iden3 = require('../index');

const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('db.export db.import', () => {
  it('encrypt', () => {
    const db = new iden3.Db();
    const kc = new iden3.KeyContainer('localStorage', db);

    const passphrase = 'this is a test passphrase';
    kc.unlock(passphrase);
    const key0 = kc.importKey(testPrivKHex);

    db.insert("this is the key", "this is the value");

    const dbExported = db.export(kc, key0, key0); // keyContainer, idaddr, ksign

    const db2 = new iden3.Db();
    db2.import(kc, dbExported);
    // expect(db).to.be.equal(dbExported);
  });
});
