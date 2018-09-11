const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');
const ethUtil = require('ethereumjs-util');

const web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
// const testPrivKHex = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';
const testPrivK = Buffer.from(testPrivKHex.replace('0x', ''), 'hex');
const idaddr = ethUtil.privateToAddress(testPrivK);
const idaddrHex = iden3.utils.bytesToHex(idaddr);
describe('getRelayRoot()', function() {
  it('getRelayRoot()', function() {
    return iden3.relay.getRelayRoot()
    .then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});
describe('getIDRoot()', function() {
  it('getIDRoot()', function() {
    return iden3.relay.getIDRoot(idaddrHex).then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});

describe('postClaim()', function() {
  it('postClaim()', function() {
    let id = new iden3.Id(web3httpURL, testPrivKHex);
    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', id.address, 'appToAuthName', 'authz', 1535208350, 1535208350);
    let signatureObj = id.sign(authorizeKSignClaim.hex());
    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature
    };
    let verified = id.verify(authorizeKSignClaim.hex(), bytesSignedMsg.signatureHex, id.address);
    expect(verified).to.be.equal(true);
    return iden3.relay.postClaim(id.address, bytesSignedMsg)
    .then(res => {
      console.log("res.data", res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});


// describe('getClaimByHi()', function() {
//   //  const hi = '0x784adb4a490b9c0521c11298f384bf847881711f1a522a40129d76e3cfc68c9a';
//   let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io',
//                   idaddrHex,
//                   'appToAuthName', 'authz', 1535208350, 1535208350);
//   const hi = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
//   it('getClaimByHi()', function() {
//     return iden3.relay.getClaimByHi(idaddrHex, hi)
//     .then(res => {
//       console.log('res.data', res.data);
//       expect(res.status).to.be.equal(400);
//     });
//   });
// });
