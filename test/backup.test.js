const chai = require('chai');
const {expect} = chai;
const iden3 = require('../index');

// const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const testPrivKHex = '5ca155481bafd651f6297f525781430e737c3e64a7f854af5870897fa307ae65';

const db = new iden3.Db();
const backup = new iden3.Backup('http://127.0.0.1:5001');
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const key0id = kc.importKey(testPrivKHex);
const relay = new iden3.Relay('http://127.0.0.1:8000');
let relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');
const kSign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');


let proofOfKSign = {};
let version = 0;
let difficulty = 1;

describe('backup.backupData backup.recoverData backup.recoverDataByTimestamp', () => {
  before(() => backup.getPoWDifficulty().then((res) => {
    console.log("dif", res.data);
    difficulty = res.data.powdifficulty;
  }));
  it('backupData', () => {

    return id.createID().then((idaddr) => {
      return id.authorizeKSignClaim(kc, id.keyOperational, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
        proofOfKSign = authRes.data.proofOfClaim;
        expect(authRes.status).to.be.equal(200);

        setTimeout(function() {
          backup.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'this is the test data', difficulty, relayAddr).then((resp) => {
            // console.log("backup", resp.data);
          });
        }, 100);
        setTimeout(function() {
          backup.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype2', 'test data 2', difficulty, relayAddr).then((resp) => {
            // console.log("backup", resp.data);
          });
        }, 500);
        backup.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'test data 3', difficulty, relayAddr).then((resp) => {
          // console.log("backup", resp.data);
        });
        setTimeout(function() {
          return backup.backupData(kc, id.idaddr, kSign, proofOfKSign, 'testtype', 'test data 4', difficulty, relayAddr).then((resp) => {
            version = resp.data.version;

            return backup.recoverData(id.idaddr).then((resp) => {
              let data = resp.data.backups;
              expect(data.length > 3).to.be.equal(true);

              console.log("version", backup.version);
              return backup.recoverDataSinceVersion(id.idaddr, backup.version - 1).then((resp) => {
                let data = resp.data.backups;
                // console.log(data);
                // let lastdata = data[0].data;
                // let r = kc.decrypt(lastdata);
                // expect(r).to.be.equal("test data 4");
                expect(data.length == 1).to.be.equal(true);
              });
            });
          });
        }, 3000);
      });

    });
  });
});

// describe('backup.recoverDataByType', () => {
//   it('recoverDataByType', () => {
//     return backup.recoverDataByType(id.idaddr, 'testtype2').then((resp) => {
//       let data = resp.data.backups;
//       let lastdata = data[0].Data;
//       console.log("l", lastdata);
//       let r = kc.decrypt(lastdata);
//       expect(r).to.be.equal("test data 2");
//     });
//   });
// });
