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

const relay = new iden3.Relay('http://127.0.0.1:5000');

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

    return relay.postClaim(id.kc.addressHex(), bytesSignedMsg).then(res => {
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
    return relay.getClaimByHi(id.kc.addressHex(), hi)
    .then(res => {
      // console.log('res.data', res.data);
      let r = res.data;
      expect(res.status).to.be.equal(200);
      expect(r.claimProof.Leaf).to.be.equal(iden3.utils.bytesToHex(authorizeKSignClaim.bytes()));
      expect(r.claimProof.Proof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(r.claimProof.Root).to.be.equal('0xd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207');
      expect(r.setRootClaimProof.Leaf).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc6b6858214fe963e0e00000000bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207');
      expect(r.setRootClaimProof.Proof).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(r.setRootClaimProof.Root).to.be.equal('0xfd89568c4dfe0b22be91c810421dcf02ac7ca42bc005461886a443fb6e0ead78');


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


describe('new KSign', function() {
  let kc = new iden3.KeyContainer(testPrivKHex);
  let id = new iden3.Id(kc);
  let kSign = new iden3.KeyContainer('289c2857d4598e37fb9647507e47a309d6133539bf21a8b9cb6df88fd5232032');
  let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io', kSign.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350);
  let signatureObj = id.kc.sign(authorizeKSignClaim.hex());

  it('newKSign()', function() {

    let bytesSignedMsg = {
      valueHex: authorizeKSignClaim.hex(),
      signatureHex: signatureObj.signature
    };

    let verified = iden3.utils.verifySignature(signatureObj.messageHash, bytesSignedMsg.signatureHex, id.kc.addressHex());
    expect(verified).to.be.equal(true);

    return relay.postClaim(id.kc.addressHex(), bytesSignedMsg).then(res => {
      console.log(res.data.root);
      expect(res.status).to.be.equal(200);

      // it('verify kSign proofs', function() {
        let hi = iden3.utils.bytesToHex(authorizeKSignClaim.hi());
        return relay.getClaimByHi(id.kc.addressHex(), hi)
        .then(res => {
          console.log(res.data.setRootClaimProof.Root);
          let r = res.data;
          expect(res.status).to.be.equal(200);
    
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
      // });
    });
  });
  
});