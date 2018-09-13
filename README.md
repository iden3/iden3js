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

#### GetRelayRoot
```js
iden3.relay.getRelayRoot()
    .then(res => {
        console.log('res.data', res.data);
    });
```

#### GetIDRoot
```js
iden3.relay.getIDRoot(id.kc.addressHex())
    .then(res => {
        console.log('res.data', res.data);
    });
```

#### PostClaim
```js
iden3.relay.postClaim(id.kc.addressHex(), bytesSignedMsg)
    .then(res => {
      console.log("res.data", res.data);
    });
```

#### GetClaimByHi
```js
iden3.relay.getClaimByHi(id.kc.addressHex(), hi)
    .then(res => {
      console.log('res.data', res.data);
    });
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
