# iden3js
Javascript client library of the iden3 system.

## Install
```
npm install iden3
```

## Usage

### Import
```js
const iden3 = require('iden3');
```

### KeyContainer
```js
// without privK
let kc = new iden3.KeyContainer();

// with privK
const privKey = 'x';
let kc = new iden3.KeyContainer(privK);
```

### Id
```js
let kc = new iden3.KeyContainer();
let id = new iden3.Id(kc);

// sign
let signatureObj = id.kc.sign('test');
/*
signatureObj:
{
  message: '0x74657374',
  messageHash: '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95',
  v: '0x1c',
  r: '0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade',
  s: '0x3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca6894104',
  signature: '0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c'
}
*/
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
    type: < Buffer cf ee 7 c 08 a9 8 f 4 b 56 5 d 12 4 c 7 e 4 e 28 ac c5 2 e 1 b c7 80 e3 88 7 d b0 a0 2 a 7 d 2 d 5 b c6 67 28 > ,
    version: < Buffer 00 00 00 00 >
  },
  extraIndex: {
    data: < Buffer 63 31 >
  }
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
    type: < Buffer 35 3 f 86 7 e f7 25 41 1 d e0 5 e 3 d 4 b 0 a 01 c3 7 c f7 ad 24 bc c2 13 14 1 a 05 ed 77 26 d7 93 2 a 1 f > ,
    version: < Buffer 00 00 00 00 >
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

#### GetRelayRoot
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

#### GetIDRoot
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

#### PostClaim
```js
relay.postClaim(id.kc.addressHex(), bytesSignedMsg)
  .then(res => {
    console.log("res.data", res.data);
  });
```

Response:
```js
{
  claimProof: '0x0000000000000000000000000000000000000000000000000000000000000000',
  idRootProof: '0x0000000000000000000000000000000000000000000000000000000000000000',
  root: '0xfd89568c4dfe0b22be91c810421dcf02ac7ca42bc005461886a443fb6e0ead78'
}
```

#### GetClaimByHi
```js
relay.getClaimByHi(id.kc.addressHex(), hi)
  .then(res => {
    console.log('res.data', res.data);
  });
```
Response:
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


### WARNING
All code here is experimental and WIP

## License
iden3js is part of the iden3 project copyright 2018 0kims association and published with GPL-3 license, please check the LICENSE file for more details.
