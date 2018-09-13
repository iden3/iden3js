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
    return iden3.relay.getRelayRoot().then(res => {
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
    let kc = new iden3.KeyContainer(testPrivKHex);
    let id = new iden3.Id(kc);
    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', id.kc.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350);
    let signatureObj = id.kc.sign(authorizeKSignClaim.hex());

    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature
    };

    let verified = iden3.utils.verifySignature(signatureObj.messageHash, bytesSignedMsg.signatureHex, id.kc.addressHex());
    expect(verified).to.be.equal(true);

    return iden3.relay.postClaim(id.kc.addressHex(), bytesSignedMsg).then(res => {
      // console.log("res.data", res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});

describe('getClaimByHi()', function() {
  let kc = new iden3.KeyContainer(testPrivKHex);
  let id = new iden3.Id(kc);
  let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', id.kc.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350);
  let hi = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
  it('getClaimByHi()', function() {
    return iden3.relay.getClaimByHi(id.kc.addressHex(), hi)
    .then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
      expect(res.data.claim).to.be.equal(authorizeKSignClaim.hex());
      expect(res.data.idProof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(res.data.idRoot).to.be.equal('0xd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207');
      expect(res.data.setRootClaim).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc6b6858214fe963e0e00000001bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207');
      expect(res.data.relayProof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(res.data.relayRoot).to.be.equal('0xfd89568c4dfe0b22be91c810421dcf02ac7ca42bc005461886a443fb6e0ead78');
    });
  });
});
