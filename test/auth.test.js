const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;
const authurl = 'http://127.0.0.1:5000';
const authwsurl = 'ws://127.0.0.1:5000';
const testPrivKHex0 = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const testPrivKHex1 = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';
let qr = '';
let ksignGeneratedInWeb = '';
const db = new iden3.Db();

function successCallback(authData) {
  console.log('websocket successCallback');
  console.log(authData);
}

describe('[auth] new QR challenge (centralized website side)', () => {
  // inside the App where the user is going to authenticate
  const kc0 = new iden3.KeyContainer('localStorage', db);
  kc0.unlock('pass');
  // let ksign = kc0.importKey(testPrivKHex0);
  ksignGeneratedInWeb = kc0.generateKeyRand();
  const auth = new iden3.Auth(kc0, ksignGeneratedInWeb, authurl, authwsurl, successCallback);
  // console.log(auth);
  qr = auth.qrHex();

  it('jsonQR.ksign equal to auth.ksign', () => {
    expect(iden3.auth.parseQRhex(qr).authurl).to.be.equal(auth.authurl);
  });

  it('jsonQR.challenge equal to auth.challenge', () => {
    expect(iden3.auth.parseQRhex(qr).challenge).to.be.equal(auth.challenge);
  });

  it('jsonQR.signed equal to auth.signed', () => {
    expect(iden3.auth.parseQRhex(qr).signature).to.be.equal(auth.signature);
  });
});

describe('[auth] authorize the KSign (from the wallet side)', () => {
  // inside Wallet App
  // new AuthorizeKSignClaim with the ksign from the QR
  // previous work: generate an identity
  const kc = new iden3.KeyContainer('localStorage', db);
  kc.unlock('pass');
  // let key0id = kc.importKey(testPrivKHex1);
  const ko = kc.generateKeyRand();
  const krec = kc.generateKeyRand();
  const krev = kc.generateKeyRand();
  const relay = new iden3.Relay('http://127.0.0.1:8000');
  const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
  const id = new iden3.Id(krec, krev, ko, relay, relayAddr, '');

  it('[auth] id.AuthorizeKSignClaim()', () => id.createID().then((res) => {
    expect(res).to.be.equal(id.idAddr);

    // decode the QR data
    const qrJson = iden3.auth.parseQRhex(qr);
    const qrKSign = iden3.utils.addrFromSig(qrJson.challenge, qrJson.signature);
    expect(qrKSign).to.be.equal(ksignGeneratedInWeb);
    // create a new AuthorizeKSignClaim signed with ID (key0id) and send it to the Relay
    const unixtime = Math.round(+new Date() / 1000);
    kc.unlock('pass');
    return id.authorizeKSignClaim(kc, id.keyOperational, '', qrKSign, 'appToAuthName', 'authz', unixtime, unixtime).then((authorizeRes) => {
      // console.log(res.data);
      const ksignProof = authorizeRes.data.proofOfClaim;
      expect(authorizeRes.status).to.be.equal(200);

      // now send the proof of the claim to the Auth centralized server
      return iden3.auth.resolv(qrJson.url, id.idAddr, qrJson.challenge, qrJson.signature, qrKSign, ksignProof).then((resolvRes) => {
        // console.log(res.data);
        expect(resolvRes.status).to.be.equal(200);
        expect(resolvRes.data.authenticated).to.be.equal(true);
      });
    });
  }));
});
