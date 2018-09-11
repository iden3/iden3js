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

### Id
```js
const privKey = 'x';
let id = new iden3.Id(web3httpURL, privKey);

// sign
let signatureObj = id.sign('message');

// verify sign
let verified = id.verify('message', signatureObj.signature, id.address);
console.log(verified); // true
```

### Claims

#### Generic Claim
```js
// new ClaimDefault
let claim = new iden3.claim.ClaimDefault('iden3.io', 'default', 'extra data');

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
iden3.relay.getIDRoot(id.address)
    .then(res => {
        console.log('res.data', res.data);
    });
```

#### PostClaim
```js
iden3.relay.postClaim(id.address, bytesSignedMsg)
    .then(res => {
      console.log("res.data", res.data);
    });
```

#### GetClaimByHi
```js
iden3.relay.getClaimByHi(id.address, hi)
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
