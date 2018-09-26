const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');
const ethUtil = require('ethereumjs-util');

// const web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
// const testPrivKHex = '289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032';
const testPrivK = Buffer.from(testPrivKHex.replace('0x', ''), 'hex');
const idaddr = ethUtil.privateToAddress(testPrivK);
const idaddrHex = iden3.utils.bytesToHex(idaddr);

const relay = new iden3.Relay('http://127.0.0.1:5000');
// const relay = new iden3.Relay('http://142.93.107.198:5000');

describe('getRelayRoot()', function() {
  it('getRelayRoot()', function() {
    return relay.getRelayRoot().then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});
describe('getIDRoot()', function() {
  it('getIDRoot()', function() {
    return relay.getIDRoot(idaddrHex).then(res => {
      // console.log('res.data', res.data);
      expect(res.status).to.be.equal(200);
    });
  });
});

describe('post ClaimDefault()', function() {
  it('post ClaimDefault()', function() {
    let kc = new iden3.KeyContainer('teststorage');
    let key0id = kc.importKey(testPrivKHex);

    let claimDefault = new iden3.claim.ClaimDefault('iden3.io', 'default', 'extraindex', 'data');
    let signatureObj = kc.sign(key0id, claimDefault.hex());
    let bytesSignedMsg = {
      valueHex: claimDefault.hex(),
      signatureHex: signatureObj.signature
    };
    return relay.postClaim(key0id, bytesSignedMsg).then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});

let kc = new iden3.KeyContainer('teststorage');
let key0id = kc.importKey(testPrivKHex);
let keyToAuth = kc.importKey('289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032');

describe('post AuthorizeKSignClaim()', function() {
  it('post AuthorizeKSignClaim()', function() {
    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', keyToAuth, 'appToAuthName', 'authz', 1535208350, 1535208350);
    let signatureObj = kc.sign(key0id, authorizeKSignClaim.hex());
    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature
    };
    return relay.postClaim(key0id, bytesSignedMsg).then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});
describe('getClaimByHi()', function() {
  let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', keyToAuth, 'appToAuthName', 'authz', 1535208350, 1535208350);

  let hi = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
  it('getClaimByHi()', function() {
    return relay.getClaimByHi(key0id, hi).then(res => {
      // console.log('res.data', res.data);
      let r = res.data;
      expect(res.status).to.be.equal(200);
      expect(r.claimProof.Leaf).to.be.equal(iden3.utils.bytesToHex(authorizeKSignClaim.bytes()));
      expect(r.claimProof.Proof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000001762e4952a1a6d1f5e771bb896469f9dd357c8c3e1e8f97c6ebb0fcbfd912db70');
      expect(r.claimProof.Root).to.be.equal('0x4a8f06e5e06e585f091032f58d5363ea1e0a7b88a8f46b74b870a9b02544779c');
      expect(r.setRootClaimProof.Leaf).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000001bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f4a8f06e5e06e585f091032f58d5363ea1e0a7b88a8f46b74b870a9b02544779c');
      expect(r.setRootClaimProof.Proof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000001d97d44500f3a18b433881edc9edfb553704282ee8b91f3252d5fb994ebcd1a10');
      expect(r.setRootClaimProof.Root).to.be.equal('0x645703140039d98916fc1f8c6e52d5e658e8d0d1812871e1d26a8de47d5b617a');

      const EmptyNodeValue = new Buffer(32);
      let verified = iden3.merkletree.checkProof(r.claimProof.Root, r.claimProof.Proof, r.claimProof.Hi, iden3.utils.bytesToHex(iden3.utils.hashBytes(iden3.utils.hexToBytes(r.claimProof.Leaf))), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.setRootClaimProof.Root, r.setRootClaimProof.Proof, r.setRootClaimProof.Hi, iden3.utils.bytesToHex(iden3.utils.hashBytes(iden3.utils.hexToBytes(r.setRootClaimProof.Leaf))), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.claimNonRevocationProof.Root, r.claimNonRevocationProof.Proof, r.claimNonRevocationProof.Hi, iden3.utils.bytesToHex(EmptyNodeValue), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.setRootClaimNonRevocationProof.Root, r.setRootClaimNonRevocationProof.Proof, r.setRootClaimNonRevocationProof.Hi, iden3.utils.bytesToHex(EmptyNodeValue), 140);
      expect(verified).to.be.equal(true);
    });
  });
});
