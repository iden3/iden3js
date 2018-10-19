const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

const authurl = 'http://127.0.0.1:5000';
const authwsurl = 'ws://127.0.0.1:5000';
let testPrivKHex0 = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
let testPrivKHex1 = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';

function successCallback(authData) {
  console.log("websocket successCallback");
  console.log(authData);
}

let qr = '';
let ksignGeneratedInWeb = '';
describe('[auth]new QR challenge (centralized website side)', function() {
  // inside the App where the user is going to authenticate
  let kc0 = new iden3.KeyContainer('teststorage');
  // let ksign = kc0.importKey(testPrivKHex0);
  ksignGeneratedInWeb = kc0.generateKey();
  let auth = new iden3.Auth(kc0, ksignGeneratedInWeb, authurl, authwsurl, successCallback);
  qr = auth.qrHex();
  it('jsonQR.ksign equal to auth.ksign', function() {
    expect(iden3.auth.parseQRhex(qr).authurl).to.be.equal(auth.authurl);
  });
  it('jsonQR.challenge equal to auth.challenge', function() {
    expect(iden3.auth.parseQRhex(qr).challenge).to.be.equal(auth.challenge);
  });
  it('jsonQR.signed equal to auth.signed', function() {
    expect(iden3.auth.parseQRhex(qr).signature).to.be.equal(auth.signature);
  });
});

describe('[auth] authorize the KSign (from the wallet side)', function() {
  // inside Wallet App
  // new AuthorizeKSignClaim with the ksign from the QR
  // previous work: generate an identity
  let kc = new iden3.KeyContainer('teststorage');
  // let key0id = kc.importKey(testPrivKHex1);
  let ko = kc.generateKey();
  let krec = kc.generateKey();
  let krev = kc.generateKey();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  let id = new iden3.Id(krec, krev, ko, relay, '');

  it('[auth] id.AuthorizeKSignClaim()', function() {
    return id.createID().then(res => {
      expect(res).to.be.equal(id.idaddr);

      // decode the QR data
      let qrJson = iden3.auth.parseQRhex(qr);
      let qrKSign = iden3.utils.addrFromSig(qrJson.challenge, qrJson.signature);
      expect(qrKSign).to.be.equal(ksignGeneratedInWeb);
      // create a new AuthorizeKSignClaim signed with ID (key0id) and send it to the Relay
      let unixtime = Math.round(+ new Date() / 1000);
      return id.AuthorizeKSignClaim(kc, id.keyOperational, 'iden3.io', qrKSign, 'appToAuthName', 'authz', unixtime, unixtime).then(res => {
        // console.log(res.data);
        ksignProof = res.data.proofOfClaim;
        expect(res.status).to.be.equal(200);

        // now send the proof of the claim to the Auth centralized server
        return iden3.auth.resolv(qrJson.url, id.idaddr, qrJson.challenge, qrJson.signature, qrKSign, ksignProof).then(res => {
          // console.log(res.data);
          expect(res.status).to.be.equal(200);
          expect(res.data.authenticated).to.be.equal(true);
        });
      });
    });
  });
});
