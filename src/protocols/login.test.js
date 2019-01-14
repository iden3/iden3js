const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;


const db = new iden3.Db();
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

const kc = new iden3.KeyContainer('localStorage', db);
kc.unlock('pass');
const key0id = kc.importKey(testPrivKHex);
const relay = new iden3.Relay('http://127.0.0.1:8000');
const id = new iden3.Id(key0id, key0id, key0id, relay, relayAddr, '');

describe('[protocol] login', () => {
  it('newRequestIdenAssert', () => {
	const date = new Date();
	const unixtime = Math.round((date).getTime() / 1000);
	const minutes = 20; // will be setted in global consts or in a config file
	const timeout = unixtime + (minutes * 60);

	const signatureRequest = iden3.protocols.login.newRequestIdenAssert('0xorigin', 'session01', timeout);
	  console.log("signatureRequest", signatureRequest);

	const expirationTime = unixtime + (3600 * 60);
	  const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest,
	  			id.idAddr, ethName, kc, ksign, proofOfKSign, expirationTime);
	  console.log("signedPacket", signedPacket);
	    expect(signedPacket).to.be.equal('a');
  });
});
