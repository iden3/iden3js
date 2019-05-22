// @flow
import {
  describe, it, before, after,
} from 'mocha';

const chai = require('chai');
// const childProcess = require('child_process');

// const { exec } = childProcess;
const { expect } = chai;
const iden3 = require('../index');

// const testPrivKHex = '5ca155481bafd651f6297f525781430e737c3e64a7f854af5870897fa307ae65';
// const relay = new iden3.Relay('http://127.0.0.1:8000');
// const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const backupUrl = 'http://127.0.0.1:5000/api/unstable';
const username = 'john@iden3.io';
const password = 'potatoes';

// let id;
// let kSign;
// let proofOfKSign = {};

describe('private-folder backup', () => {
  const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
  let dataBase;
  let keyContainer;
  let backupService;
  let backup;

  before('create db and key container', () => {
    dataBase = new iden3.Db.LocalStorage();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    keyContainer.unlock('pass');
    keyContainer.generateKeyBackUp(mnemonic);
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      dataBase.insert(key, value);
    }
    backup = dataBase.exportWallet(keyContainer);
  });

  before('create backup service and register', async () => {
    backupService = new iden3.Backup(backupUrl, username, password, true);
    const resp = await backupService.register();
    expect(resp.status).to.be.equal(200);
  });

  after('lock keyContainer', () => {
    keyContainer.lock();
  });

  it('backup upload', async () => {
    const resp = await backupService.upload(backup)
    expect(resp.status).to.be.equal(200);
  });

  it('backup download', async () => {
    const resp = await backupService.download()
    expect(resp.status).to.be.equal(200);
    expect(resp.data.backup).to.be.equal(backup);
  });
});

// describe('[private-folder] backup.backupData backup.recoverData backup.recoverDataSinceVersion', () => {
//   before(() => backup.getPoWDifficulty().then((res) => {
//     // const difficulty = res.data.powdifficulty;
//     // console.log('difficulty', difficulty);
//   }));
//
//   before('Delete virtual keyContainer', () => {
//     exec('rm -f tmp/*');
//     const key0id = kc.importKey(testPrivKHex);
//     id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');
//     kSign = kc.importKey('0dbabbab11336c9f0dfdf583309d56732b1f8a15d52a7412102f49cf5f344d05');
//   });
//
//   it('backupData', () => id.createID().then(() => {
//     return id.authorizeKSignClaim(kc, id.keyOperational, {}, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
//       proofOfKSign = authRes.data.proofOfClaim;
//       expect(authRes.status).to.be.equal(200);
//
//       setTimeout(() => {
//         backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'this is the test data', relayAddr).then((resp) => {
//           // console.log("backup", resp.data);
//         });
//       }, 100);
//       setTimeout(() => {
//         backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype2', 'test data 2', relayAddr).then((resp) => {
//           // console.log("backup", resp.data);
//         });
//       }, 500);
//
//       backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'test data 3', relayAddr).then((resp) => {
//         // console.log("backup", resp.data);
//       });
//       setTimeout(() => {
//         return backup.backupData(kc, id.idAddr, kSign, proofOfKSign, 'testtype', 'test data 4', relayAddr).then((resp) => {
//
//           return backup.recoverData(id.idAddr).then((resp) => {
//             const data = resp.data.backups;
//             expect(data.length > 3).to.be.equal(true);
//
//             console.log('version', backup.version);
//             return backup.recoverDataSinceVersion(id.idAddr, backup.version - 1).then((resp) => {
//               const data = resp.data.backups;
//               // console.log(data);
//               // let lastdata = data[0].data;
//               // let r = kc.decrypt(lastdata);
//               // expect(r).to.be.equal("test data 4");
//               expect(data.length === 1).to.be.equal(true);
//             });
//           });
//         });
//       }, 4000);
//     });
//   }));
// });

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
