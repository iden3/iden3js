const chai = require('chai');
const {expect} = chai;
const iden3 = require('../index');

// const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const testPrivKHex = '5ca155481bafd651f6297f525781430e737c3e64a7f854af5870897fa307ae65';

// describe('db.export db.import', () => {
//   it('encrypt', () => {
//     const db = new iden3.Db();
//     const kc = new iden3.KeyContainer('localStorage', db);
//     kc.unlock('pass');
//
//     const passphrase = 'this is a test passphrase';
//     kc.unlock(passphrase);
//     const key0 = kc.importKey(testPrivKHex);
//
//     db.insert("this is the key", "this is the value");
//
//     const dbExported = db.export(kc, key0, key0); // keyContainer, idaddr, ksign
//
//     const db2 = new iden3.Db();
//     db2.import(kc, dbExported);
//     expect(db).to.be.equal(dbExported);
//   });
// });

const db = new iden3.Db('http://127.0.0.1:6000');
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const key0id = kc.importKey(testPrivKHex);
const relay = new iden3.Relay('http://127.0.0.1:8000');
const id = new iden3.Id(key0id, key0id, key0id, relay, '');
const kSign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
let relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

let proofOfKSign = {};
let timestamp = 0;

describe('db.backupData db.recoverData db.recoverDataByTimestamp', () => {
  it('backupData', () => {
    return id.createID().then((idaddr) => {
      return id.authorizeKSignClaim(kc, id.keyOperational, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
        proofOfKSign = authRes.data.proofOfClaim;
        expect(authRes.status).to.be.equal(200);

        setTimeout(function() {
          db.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'this is the test data', relayAddr).then((resp) => {
            // console.log("backup", resp.data);
          });
        }, 500);
        setTimeout(function() {
          db.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype2', 'test data 2', relayAddr).then((resp) => {
            // console.log("backup", resp.data);
          });
        }, 1000);
        db.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'test data 3', relayAddr).then((resp) => {
          // console.log("backup", resp.data);
        });
        setTimeout(function() {
          return db.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'test data 4', relayAddr).then((resp) => {
            timestamp = resp.data.timestamp;

            return db.recoverData(id.idaddr).then((resp) => {
              let data = resp.data.backups;
              let lastdata = data[data.length-1].Data;
              let r = kc.decrypt(lastdata);
              expect(r).to.be.equal("test data 4");
              expect(data.length>3).to.be.equal(true);

              return db.recoverDataByTimestamp(id.idaddr, timestamp).then((resp) => {
                let data = resp.data.backups;
                let lastdata = data[0].Data;
                let r = kc.decrypt(lastdata);
                expect(r).to.be.equal("test data 4");
              });
            });
          });
        }, 4000);
      });

    });
  });
});

// describe('db.recoverDataByType', () => {
//   it('recoverDataByType', () => {
//     return db.recoverDataByType(id.idaddr, 'testtype2').then((resp) => {
//       let data = resp.data.backups;
//       let lastdata = data[0].Data;
//       console.log("l", lastdata);
//       let r = kc.decrypt(lastdata);
//       expect(r).to.be.equal("test data 2");
//     });
//   });
// });
