const chai = require('chai');
const childProcess = require('child_process');

const { exec } = childProcess;
const { expect } = chai;
const iden3 = require('../index');


const testPrivKHex = '5ca155481bafd651f6297f525781430e737c3e64a7f854af5870897fa307ae65';

const db = new iden3.Db();
const backup = new iden3.PrivateFolder('http://127.0.0.1:5001');
const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const relay = new iden3.Relay('http://127.0.0.1:8000');
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
let id;
let kSign;


let proofOfKSign = {};

describe('[private-folder] backup.backupData backup.recoverData backup.recoverDataSinceVersion', () => {
  before(() => backup.getPoWDifficulty().then((res) => {
    // const difficulty = res.data.powdifficulty;
    // console.log('difficulty', difficulty);
  }));

  before('Delete virtual keyContainer', () => {
    exec('rm -f tmp/*');
    const key0id = kc.importKey(testPrivKHex);
    id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');
    kSign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
  });

  it('backupData', () => id.createID().then(() => {
    return id.authorizeKSignClaim(kc, id.keyOperational, {}, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
      proofOfKSign = authRes.data.proofOfClaim;
      expect(authRes.status).to.be.equal(200);

      setTimeout(() => {
        backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'this is the test data', relayAddr).then((resp) => {
          // console.log("backup", resp.data);
        });
      }, 100);
      setTimeout(() => {
        backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype2', 'test data 2', relayAddr).then((resp) => {
          // console.log("backup", resp.data);
        });
      }, 500);

      backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'test data 3', relayAddr).then((resp) => {
        // console.log("backup", resp.data);
      });
      setTimeout(() => {
        return backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'test data 4', relayAddr).then((resp) => {

          return backup.recoverData(id.idAddr).then((resp) => {
            const data = resp.data.backups;
            expect(data.length > 3).to.be.equal(true);

            console.log('version', backup.version);
            return backup.recoverDataSinceVersion(id.idAddr, backup.version - 1).then((resp) => {
              const data = resp.data.backups;
              // console.log(data);
              // let lastdata = data[0].data;
              // let r = kc.decrypt(lastdata);
              // expect(r).to.be.equal("test data 4");
              expect(data.length === 1).to.be.equal(true);
            });
          });
        });
      }, 4000);
    });
  }));
});

// describe('backup.recoverDataByType', () => {
//   it('recoverDataByType', () => {
//     return backup.recoverDataByType(id.idAddr, 'testtype2').then((resp) => {
//       let data = resp.data.backups;
//       let lastdata = data[0].Data;
//       console.log("l", lastdata);
//       let r = kc.decrypt(lastdata);
//       expect(r).to.be.equal("test data 2");
//     });
//   });
// });
