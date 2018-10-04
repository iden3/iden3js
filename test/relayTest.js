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

const relay = new iden3.Relay('http://127.0.0.1:8000');
// const relay = new iden3.Relay('http://142.93.107.198:8000');

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

let kc = new iden3.KeyContainer('teststorage');
let key0id = kc.importKey(testPrivKHex);
let ksign = kc.importKey('289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032');

describe('post ClaimDefault()', function() {
    let proofOfKSign = {};

    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', ksign, 'appToAuthName', 'authz', 1535208350, 1535208350);
    let signatureObj = kc.sign(key0id, authorizeKSignClaim.hex());
    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: key0id
    };
    before(function() {
      return relay.postClaim(key0id, bytesSignedMsg).then(res => {
        proofOfKSign = res.data.proofOfClaim;
        expect(res.status).to.be.equal(200);
      });
    });



  it('post ClaimDefault()', function() {
    let claimDefault = new iden3.claim.ClaimDefault('iden3.io', 'default', 'extraindexdatastr', 'data');
    let signatureObj = kc.sign(ksign, claimDefault.hex());
    let bytesSignedMsg = {
      valueHex: claimDefault.hex(),
      signatureHex: signatureObj.signature,
      ksign: ksign,
      proofOfKSign: proofOfKSign
    };
    return relay.postClaim(key0id, bytesSignedMsg).then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});



describe('getClaimByHi()', function() {
  let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', ksign, 'appToAuthName', 'authz', 1535208350, 1535208350);

  let hi = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
  it('getClaimByHi()', function() {
    return relay.getClaimByHi(key0id, hi).then(res => {
      // console.log('res.data', res.data);
      let r = res.data.proofOfClaim;
      expect(res.status).to.be.equal(200);
      expect(r.ClaimProof.Leaf).to.be.equal(iden3.utils.bytesToHex(authorizeKSignClaim.bytes()));
      expect(r.ClaimProof.Proof).to.be.equal('0x00000000000000000000000000000000000000000000000000000000000000052d3cbe677b6e4048e0db5a3d550e5f1bb2252c099a990137ac644ddfff9553dde5d128f57df872a6ab1c768ab3da7fc08faa153d4ac40c33471d25be32b38132');
      expect(r.ClaimProof.Root).to.be.equal('0xb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101');
      expect(r.SetRootClaimProof.Leaf).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000003bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101');
      // expect(r.SetRootClaimProof.Proof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000001d97d44500f3a18b433881edc9edfb553704282ee8b91f3252d5fb994ebcd1a10'); // each time is different due previous tests, that add random data to the Merkle Tree
      // expect(r.SetRootClaimProof.Root).to.be.equal('0x645703140039d98916fc1f8c6e52d5e658e8d0d1812871e1d26a8de47d5b617a');

      let verified = iden3.merkletree.checkProof(r.ClaimProof.Root, r.ClaimProof.Proof, r.ClaimProof.Hi, iden3.utils.bytesToHex(iden3.utils.hashBytes(iden3.utils.hexToBytes(r.ClaimProof.Leaf))), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.SetRootClaimProof.Root, r.SetRootClaimProof.Proof, r.SetRootClaimProof.Hi, iden3.utils.bytesToHex(iden3.utils.hashBytes(iden3.utils.hexToBytes(r.SetRootClaimProof.Leaf))), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.ClaimNonRevocationProof.Root, r.ClaimNonRevocationProof.Proof, r.ClaimNonRevocationProof.Hi, iden3.utils.bytesToHex(iden3.merkletree.EmptyNodeValue), 140);
      expect(verified).to.be.equal(true);
      verified = iden3.merkletree.checkProof(r.SetRootClaimNonRevocationProof.Root, r.SetRootClaimNonRevocationProof.Proof, r.SetRootClaimNonRevocationProof.Hi, iden3.utils.bytesToHex(iden3.merkletree.EmptyNodeValue), 140);
      expect(verified).to.be.equal(true);
    });
  });
});

let keyToAuth = kc.importKey('33691d1a1b408022e01af0d1a04cab43fb8c6a4c2168b43fb7907d522b79d7f2');
describe('post AuthorizeKSignClaim()', function() {
  it('post AuthorizeKSignClaim()', function() {
    let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', keyToAuth, 'appToAuthName', 'authz', 1535208350, 1535208350);
    let signatureObj = kc.sign(key0id, authorizeKSignClaim.hex());
    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature,
      ksign: key0id
    };
    return relay.postClaim(key0id, bytesSignedMsg).then(res => {
      expect(res.status).to.be.equal(200);
    });
  });
});
