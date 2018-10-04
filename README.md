# iden3js
Javascript client library of the iden3 system.

## Install
```
npm install --save iden3
```

## Basic example
```js
// import iden3js
const iden3 = require('iden3');

// new key container
let kc = new iden3.KeyContainer('teststorage');

// import key into the key container
let keyId = kc.importKey('x'); // keyId is the address that is used to identify the key

// generate new keys
let keyRecover = kc.generateKey();
let keyRevoke = kc.generateKey();
let keyOp = kc.generateKey();

// create a new relay object
const relay = new iden3.Relay('http://127.0.0.1:5000');

// create a new id object
let id = new iden3.Id(keyRecover, keyRevoke, keyOp, relay, '');

// generate new key that will be the one authorized by the other key
let ksign = kc.generateKey();

let unixtime = Math.round(+new Date()/1000);
// create new AuthorizeKSignClaim, sign it, and send it to the Relay
id.AuthorizeKSignClaim(kc, key0id, 'iden3.io', ksign, 'appToAuthName', 'authz', unixtime, unixtime).then(res => {
  proofOfKSign = res.data.proofOfClaim;
});

// create new ClaimDefault, sign it and send it to the Relay
id.ClaimDefault(kc, ksign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
  let proofOfClaim = res.data.proofOfClaim;
});



// having a proofOfClaim, let's check it
let verified = iden3.merkletree.checkProofOfClaim(proofOfClaim, 140);
// verified == true
```

## Usage

### Import
```js
const iden3 = require('iden3');
```

### KeyContainer
```js
// new key container
let kc = new iden3.KeyContainer('teststorage');

// import key
let key0id = kc.importKey('x');
// key0id is the address of the imported key, will be used as key identifier

// generate key
let key1id = kc.generateKey();
// key1id is the address of the generated key, will be used as key identifier

// sign using key0id
let signature = kc.sign(key0id, 'test');
```

### Id
```js
// new key container
let kc = new iden3.KeyContainer();
let key0id = kc.generateKey();
// new relay
const relay = new iden3.Relay('http://127.0.0.1:5000');
// create key
let id = new iden3.Id(keyRecover, keyRevoke, keyOp, relay, '');
```

#### id.AuthorizeKSignClaim
```js
// perform a new AuthorizeKSignClaim, sign it, and post it to the Relay
let keyToAuth = kc.generateKey();
id.AuthorizeKSignClaim(kc, key0id, 'iden3.io', keyToAuth, 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
  //
});
```

#### id.ClaimDefault
```js
// perform a new ClaimDefault, sign it, and post it to the Relay
id.ClaimDefault(kc, ksign, proofOfKSign, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
  //
});
```


### Claims

#### Generic Claim
```js
// new ClaimDefault
let claim = new iden3.claim.ClaimDefault('iden3.io', 'default', 'extra data');
/*
claim:
{
  baseIndex: {
    namespace: < Buffer 3 c fc 3 a 1 e db f6 91 31 6 f ec 9 b 75 97 0 f bf b2 b0 e8 d8 ed fc 6 e c7 62 8 d b7 7 c 49 69 40 30 74 > ,
    type: < Buffer cf ee 7 c 08 a9 8 f 4 b 56 5 d 12 4 c 7 e 4 e 28 ac c5 2 e 1 b c7 80 e3 88 7 d b0 > ,
    indexLength: 66,
    version: 0
  },
  extraIndex: {
    data: < Buffer 63 31 >
  },
  data: < Buffer >
}
*/
// methods of the ClaimDefault
claim.bytes(); // claim in Buffer representation
claim.hi(); // Hash of the index of the claim in Buffer representation
claim.ht(); // Hash of the claim in Buffer representation

// parse ClaimDefault from Buffer
let claimParsed = iden3.claim.parseClaimDefaultBytes(claim.bytes());
```

#### AuthorizeKSignClaim

```js
// new AuthorizeKSignClaim
let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('iden3.io',
                  '0x101d2fa51f8259df207115af9eaa73f3f4e52e60',
                  'appToAuthName', 'authz', 1535208350, 1535208350);
/*
authorizeKSignClaim:
{
  baseIndex: {
    namespace: < Buffer 3 c fc 3 a 1 e db f6 91 31 6 f ec 9 b 75 97 0 f bf b2 b0 e8 d8 ed fc 6 e c7 62 8 d b7 7 c 49 69 40 30 74 > ,
    type: < Buffer 35 3 f 86 7 e f7 25 41 1 d e0 5 e 3 d 4 b 0 a 01 c3 7 c f7 ad 24 bc c2 13 14 1 a > ,
    indexLength: 84,
    version: 0
  },
  extraIndex: {
    keyToAuthorize: '0x101d2fa51f8259df207115af9eaa73f3f4e52e60'
  },
  application: < Buffer 20 77 bb 3 f 04 00 dd 62 42 1 c 97 22 05 36 fd 6 e d2 be 29 22 8 e 8 d b1 31 5 e 8 c 6 d 75 25 f4 bd f4 > ,
  applicationAuthz: < Buffer da d9 96 6 a 2 e 73 71 f0 a2 4 b 19 29 ed 76 5 c 0 e 7 a 3 f 2 b 46 65 a7 6 a 19 d5 81 73 30 8 b b3 40 62 > ,
  validFrom: 1535208350,
  validUntil: 1535208350
}
*/
// methods of the AuthorizeKSignClaim
authorizeKSignClaim.bytes(); // claim in Buffer representation
authorizeKSignClaim.hi(); // Hash of the index of the claim in Buffer representation
authorizeKSignClaim.ht(); // Hash of the index of the claim in Buffer representation

// parse AuthorizeKSignClaim from Buffer
let authorizeKSignClaimParsed = iden3.claim.parseAuthorizeKSignClaim(authorizeKSignClaim.bytes());
```


### Merkletree

#### CheckProof
```js
let verified = iden3.merkletree.checkProof(rootHex, mpHex, hiHex, htHex, numLevels);
console.log(verified); // true
```

#### CheckProofOfClaim
This function checks the data structure of `proofOfClaim` and returns true if all the proofs are correct.
Internally, it usees the `iden3.merkletree.checkProof()` function, for each one of the proofs that are contained inside `proofOfClaim` data object.
```js
let verified = iden3.merkletree.checkProofOfClaim(proofOfClaim, 140);
console.log(verified); // true
```

#### Utils
```js
// hash Buffer
let hash = iden3.utils.hashBytes(b);

let hex = iden3.utils.bytesToHex(buff); // returns a Hexadecimal representation of a Buffer
let buff = iden3.utils.hexToBytes(hex); // returns a Buffer from a Heximal representation string

// verify signature
let verified = iden3.utils.verifySignature(msgHashHex, signatureHex, addressHex);
// verified: true
```


### Relay http
Connectors to interact with the relay API REST.

#### Create Relay object
```js
const relay = new iden3.Relay('http://127.0.0.1:5000');
```

#### relay.getRelayRoot
```js
relay.getRelayRoot()
  .then(res => {
    console.log('res.data', res.data);
  });
```

Response:
```js
{
  contractRoot: '0x6e4659fedd8ff00b14e487d6d5f537646f07bde944d935d51bd9de807d6fc1c9',
  root: '0x0000000000000000000000000000000000000000000000000000000000000000'
}
```

#### relay.getIDRoot
```js
relay.getIDRoot(id.kc.addressHex())
  .then(res => {
    console.log('res.data', res.data);
  });
```
Response:
```js
{
  idRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
  idRootProof: '0x0000000000000000000000000000000000000000000000000000000000000000',
  root: '0x0000000000000000000000000000000000000000000000000000000000000000'
}
```

#### relay.ClaimDefault
Creates a new AuthorizeKSignClaim, signs it, and sends it to the Relay.
```js
relay.ClaimDefault(id.kc, ksign, proofOfKSign, 'iden3.io', 'default', 'data of the claim').then(res => {
  // console.log("res.data", res.data);
  expect(res.status).to.be.equal(200);
});
```

#### relay.AuthorizeKSignClaim
Creates a new AuthorizeKSignClaim, signs it, and sends it to the Relay.
```js
relay.AuthorizeKSignClaim(id.kc, keyid, 'iden3.io', kSign.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
  // console.log("res.data", res.data);
  expect(res.status).to.be.equal(200);
});
```

#### relay.postClaim
Sends to the Relay a signed Claim.
```js
relay.postClaim(idaddr, bytesSignedMsg)
  .then(res => {
    console.log("res.data", res.data);
  });
```

The response is the `ProofOfClaim`, same as returned in relay.getClaimByHi().

#### relay.getClaimByHi
```js
relay.getClaimByHi(idaddr, hi)
  .then(res => {
    console.log('res.data', res.data);
  });
```
Response, `ProofOfClaim`:
```js
{
  claimProof: {
    Leaf: '0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a05ed7726d7932a1f00000000bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f2077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e',
    Hi: '0x438a26007910a723fedf030efd08fed2d374634eb8866ce595c139ea341daa43',
    Proof: '0x0000000000000000000000000000000000000000000000000000000000000000',
    Root: '0xd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207'
  },
  setRootClaimProof: {
    Leaf: '0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc6b6858214fe963e0e00000000bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207',
    Hi: '0xbadb12c663dc83678de0709619fb8c67f939b7a2c5c658a6305fa4841e62e392',
    Proof: '0x0000000000000000000000000000000000000000000000000000000000000000',
    Root: '0xfd89568c4dfe0b22be91c810421dcf02ac7ca42bc005461886a443fb6e0ead78'
  },
  claimNonRevocationProof: {
    Leaf: '0x0000000000000000000000000000000000000000000000000000000000000000',
    Hi: '0x1d4221032dae2392d162cf09030f5ad9fb135380a49bb1e8caf549aaea42b53f',
    Proof: '0x0000000000000000000000000000000000000000000000000000000000000004ce587b2d039c876de24e8b7fbdeb4cf6b84d542a60cdef47cf0ab29c631fba26',
    Root: '0xd1d3ebd84f46ec73767a2fe89930f33eef96ddf18c35e03faf03a98c8e6bf207'
  },
  setRootClaimNonRevocationProof: {
    Leaf: '0x0000000000000000000000000000000000000000000000000000000000000000',
    Hi: '0x28f5ee91e756ec1a3d1ea9ca2a68b5dde6ded3ea98effeadcefbff9a352aa434',
    Proof: '0x0000000000000000000000000000000000000000000000000000000000000002b8193081f59feef7baab60cd827267371b2e6495cd2efab189370e0e2ea5819c',
    Root: '0xfd89568c4dfe0b22be91c810421dcf02ac7ca42bc005461886a443fb6e0ead78'
  }
}
```

## Tests
To run all tests, needs to have a running [Relay](https://github.com/iden3/go-iden3) node.

```
npm test
```

## Browserify bundle
To generate the browserify bundle:
```
browserify index.js --standalone iden3 > iden3js-bundle.js
```


### WARNING
All code here is experimental and WIP

## License
iden3js is part of the iden3 project copyright 2018 0kims association and published with GPL-3 license, please check the LICENSE file for more details.
