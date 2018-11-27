const chai = require('chai');
const {expect} = chai;
const iden3 = require('../index');

const testPrivKHex = '8eeba14cc730cc3d8a80d355308904f4239d3550c639137f715b41bd3ee817ce';

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

describe('id.genericClaim with backup', () => {
  before(() => backup.getPoWDifficulty().then((res) => {
    // difficulty = res.data.powdifficulty;
  }));
  before(() => id.authorizeKSignClaim(kc, id.keyOperational, kSign, '', 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
    proofOfKSign = authRes.data.proofOfClaim;
    expect(authRes.status).to.be.equal(200);
  }));

  return id.createID().then((idaddr) => {
    return id.authorizeKSignClaim(kc, id.keyOperational, proofOfKSign, kSign, 'appToAuthName', 'authz', 1535208350, 1535208350).then((authRes) => {
      proofOfKSign = authRes.data.proofOfClaim;
      expect(authRes.status).to.be.equal(200);

      it('id.genericClaim()', () => id.genericClaim(kc, kSign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then((claimDefRes) => {
        expect(claimDefRes.status).to.be.equal(200);
      }));
    });
  });
});
