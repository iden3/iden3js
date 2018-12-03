# iden3js
Javascript client library of the iden3 system.

## Install
```
npm install --save iden3
```
https://www.npmjs.com/package/iden3

## Basic example
```js
// import iden3js
const iden3 = require('iden3');

// new database
const db = new iden3.Db();
// new key container using localStorage
const kc = new iden3.KeyContainer('localStorage', db);

// unlock the KeyContainer for the next 30 seconds
let passphrase = 'this is a test passphrase';
kc.unlock(passphrase);

// generate new keys
let keys = kc.generateKeysMnemonic();
/*
keys =
{
  keys: [
    '0x94f1d9fdf01abec15ba9c473dbb87f9931986a86',
    '0xa50970867092c1ae769fc24d5f5151c7b87ff715',
    '0x1526824c893cb894d18f0cc400c24d96340a4341'
  ],
  mnemonic: 'blanket kick genre rubber better helmet youth slush acid select brick setup'
}
*/
let keyRecover = keys.keys[0];
let keyRevoke = keys.keys[1];
let keyOp = keys.keys[2];


// also we can import an already existing seed
let seed = 'blanket kick genre rubber better helmet youth slush acid select brick setup';
let keys = kc.generateKeysMnemonic(seed);

// For more info and details about mnemonic, see section Usage>KeyContainer


// Also, we have other 2 methods to create keys, kc.importKey and kc.generateKeyRand:

// import privkey
let key0id = kc.importKey('privKHex');
// key0id is the address of the imported key, will be used as key identifier

// generate key random
let key1id = kc.generateKeyRand();
// key1id is the address of the generated key, will be used as key identifier


// create a new relay object
const relay = new iden3.Relay('http://127.0.0.1:5000');

// create a new id object
let id = new iden3.Id(keyRecover, keyRevoke, keyOp, relay, '');

// create the counterfactoual contract through the relay, get the identity address as response
id.createID().then(res => {
  console.log(res);
  console.log(id.idaddr); // res == id.idaddr
});

// bind the identity address to a name. Internally, signs the idaddr+name, and sends it to the relay, that will perform an AssignNameClaim vinculating the identity address with the name.
id.bindID(kc, 'username').then(res => {
  console.log(res.data);
});

// generate new key that will be the one authorized by the other key
let ksign = kc.generateKeyRand();

let unixtime = Math.round(+new Date()/1000);
// create new AuthorizeKSignClaim, sign it, and send it to the Relay
id.authorizeKSignClaim(kc, keyOp, ksign, 'appToAuthName', 'authz', unixtime, unixtime).then(res => {
  let proofOfKSign = res.data.proofOfClaim;
});

// create new genericClaim, sign it and send it to the Relay
id.genericClaim(kc, ksign, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
  let proofOfClaim = res.data.proofOfClaim;
});


// having a proof of a leaf, we can check it
let verified = iden3.merkleTree.checkProof(rootHex, mpHex, hiHex, htHex, numLevels);
// verified == true

// having a proofOfClaim, let's check it
let verified = iden3.claim.checkProofOfClaim(proofOfClaim, 140);
// verified == true



// centralized authentication
// once have the QR data scanned, or the hex QR data copied
let qrJson = iden3.auth.parseQRhex(qrHex);
let qrKSign = iden3.utils.addrFromSig(qrJson.challenge, qrJson.signature);
// perform the AuthorizeKSignClaim over the qrKSign
id.authorizeKSignClaim(kc, id.keyOperational, qrKSign, 'appToAuthName', 'authz', unixtimeFrom, unixtimeUntil).then(res => {
  let ksignProof = res.data.proofOfClaim;

  // send the challenge, signature, KSign, and KSignProof to the qr url, that is the url of the backend of the centralized auth
  iden3.auth.resolv(qrJson.url, id.keyOperational, qrJson.challenge, qrJson.signature, qrKSign, ksignProof).then(res => {
    console.log('centralized auth success, the website will refresh with the jwt');
  })
  .catch(function (error) {
    console.log(error);
  });
})
.catch(function (error) {
  console.log(error);
});
```

## Usage

### Import
```js
const iden3 = require('iden3');
```

### KeyContainer

- new KeyContainer using localStorage
  ```js
  // new key container
  let kc = new iden3.KeyContainer('localStorage');

  ```

Usage:
```js
// unlock the KeyContainer
let passphrase = 'this is a test passphrase';
kc.unlock(passphrase);

// we can generate a new mnemonic just calling:
let keys = kc.generateKeysMnemonic();
/*
this returns:
keys =
{
  keys: [ // addresses of the keys
    '0x94f1d9fdf01abec15ba9c473dbb87f9931986a86',
    '0xa50970867092c1ae769fc24d5f5151c7b87ff715',
    '0x1526824c893cb894d18f0cc400c24d96340a4341'
  ],
  mnemonic: 'blanket kick genre rubber better helmet youth slush acid select brick setup'
}
*/

// also we can import an already existing seed
let seed = 'blanket kick genre rubber better helmet youth slush acid select brick setup';
let keys = kc.generateKeysMnemonic(seed);

/*
And we can specify the diferent identity profiles that we want to derivate from that seed.
We can specify which identity profile we want to derivate, and how many keys we want to generate
*/

// for example, for our first identity0, we want 4 different keys, so will call the method specifying that we want the identity profile 0, and 4 keys:
let keys_id0 = kc.generateKeysMnemonic(seed, 0, 4);
// for the idenity1, we want 2 keys:
let keys_id1 = kc.generateKeysMnemonic(seed, 1, 2);
// and for the identity2 we want 5 keys:
let keys_id2 = kc.generateKeysMnemonic(seed, 2, 5);

// by default, if we don't specify the path profile and the number of keys, the function returns 3 keys for the path profile 0.


// Also, we have other 2 methods to create keys, kc.importKey and kc.generateKeyRand:

// import key
let key0id = kc.importKey('privKHex');
// key0id is the address of the imported key, will be used as key identifier

// generate key
let key1id = kc.generateKeyRandom();
// key1id is the address of the generated key, will be used as key identifier


// sign using key0id
let signature = kc.sign(key0id, 'test');

// get an array with the address identifiers of the keys stored in the KeyContainer
let keysList = kc.listKeys();
```

### Id
```js
// new key container
let kc = new iden3.KeyContainer();

// unlock the KeyContainer for the next 30 seconds
let passphrase = 'this is a test passphrase';
kc.unlock(passphrase);

// generate new keys
let keyRecover = kc.generateKey();
let keyRevoke = kc.generateKey();
let keyOp = kc.generateKey();

// new relay
const relay = new iden3.Relay('http://127.0.0.1:5000');
// create key
let id = new iden3.Id(keyRecover, keyRevoke, keyOp, relay, '');
```

#### id.createID
Creates the counterfactual contract through the `Relay`, and gets the identity address.
```js
id.createID().then(res => {
  console.log(res);
});
```

Output:
```js
{
  idaddr : '0x46b57a3f315f99a6de39406310f5bd0db03326c1'
}
```

#### id.deployID
Deploys the counterfactual smart contract of identity to the blockchain.
```js
id.deployID().then(res => {
  console.log(res.data);
});
```

Output:
```js
{
  idaddr: '0x8435ebb41634c05019be1710be0007fa0d92861f',
  tx: '0x403859ccc701eb358d3a25c908c33de733cbb2d0ebc1c7738eed4908cc8cf5c4'
}
```

#### id.bindID
Vinculates a name to the identity.
Internally, signs the idaddr+name, and sends it to the `Relay`, that will perform an AssignNameClaim vinculating the identity address with the name.

```js
id.bindID(kc, name).then(res => {
  console.log(res.data);
});
```

Output:
```js
{
  ethID: '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f',
  name: 'username',
  signature: '0xeda8b278eae69cd8c4863380f0af5cfe8360481790d8ea5c188705b552bc0d5e1384efb627db5b423d4a163ad02ca23a2f05eea5dc787ac5837789aa95f50f101b'
}
```

#### id.authorizeKSignClaim
```js
// perform a new AuthorizeKSignClaim, sign it, and post it to the Relay
let keyToAuth = kc.generateKey();
id.authorizeKSignClaim(kc, key0id, keyToAuth, 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
  //
});
```

#### id.genericClaim
```js
// perform a new genericClaim, sign it, and post it to the Relay
id.genericClaim(kc, ksign, 'iden3.io', 'default', 'extraindex', 'data').then(res => {
  //
});
```


### Claims

#### Generic Claim
```js
// new GenericClaim
let claim = new iden3.claim.GenericClaim('iden3.io', 'default', 'extra index data', 'extra data');
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
// methods of the GenericClaim
claim.bytes(); // claim in Buffer representation
claim.hi(); // Hash of the index of the claim in Buffer representation
claim.ht(); // Hash of the claim in Buffer representation

// parse GenericClaim from Buffer
let claimParsed = iden3.claim.parseGenericClaimBytes(claim.bytes());
```

#### authorizeKSignClaim

```js
// new AuthorizeKSignClaim
let authorizeKSignClaim = new iden3.claim.AuthorizeKSignClaim('0x101d2fa51f8259df207115af9eaa73f3f4e52e60',
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

#### checkProofOfClaim
This function checks the data structure of `proofOfClaim` and returns true if all the proofs are correct.
Internally, it usees the `iden3.merkleTree.checkProof()` function, for each one of the proofs that are contained inside `proofOfClaim` data object.

Checks the full `proof` of a `claim`. This means check the:
- `Merkle Proof` of the `claim`
- `Merkle Proof` of the non revocation `claim`
- `Merkle Proof` of the `claim` that the `Relay` have performed over the `identity` `Merkle Root` (this kind of claim is the `SetRootClaim`)
- `Merkle Proof` of the non revocation of the `SetRootClaim`

```js
let proofOfClaimStr = `
{
  "ClaimProof": {
    "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000000970e8128ab834e8eac17ab8e3812f010678cf7912077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e",
    "Proof": "0x00000000000000000000000000000000000000000000000000000000000000052d3cbe677b6e4048e0db5a3d550e5f1bb2252c099a990137ac644ddfff9553dde5d128f57df872a6ab1c768ab3da7fc08faa153d4ac40c33471d25be32b38132",
    "Root": "0xb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101"
  },
  "SetRootClaimProof": {
    "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000003bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101",
    "Proof": "0x000000000000000000000000000000000000000000000000000000000000000b7d2ff8e70da77ef7559614425aa33021eb88752f63a690911c031a1fae273f9393b3f57a79800ca02cd1ac3a555d9dbb7d5869251d51d34e01d7de4ab811e9753cb6d37abb4eae8eeea11cbae9a96a021e2d157340721884763fc2ac33313ecd",
    "Root": "0x33f1e9b3ed86317369938d5bb04ba23e5f5de65da07c3a9368ffe19121e7a6c6"
  },
  "ClaimNonRevocationProof": {
    "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000001970e8128ab834e8eac17ab8e3812f010678cf7912077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e",
    "Proof": "0x0000000000000000000000000000000000000000000000000000000000000003df560419165ec6b3299f04ac93510999379987ff25b0799a738ad0d078c9b9d6f912e7e2fab90f745aab5874a5e4f7657921b271378ea05ee9b0f25d69f87a3c",
    "Root": "0xb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101"
  },
  "SetRootClaimNonRevocationProof": {
    "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000004bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101",
    "Proof": "0x000000000000000000000000000000000000000000000000000000000000000b615fadf56023c4ef72c3d455f0e6b6f9ace467e751e9b8e350fe0401368faf4801d4499dba57c843cd6c64fb07975d506e27b5e68166493618405a4bbf2b256eaf677f70fad9050c9d8e77b727fe6d29187c054cd47cfb3fcc10b2a4cbf08f8c",
    "Root": "0x33f1e9b3ed86317369938d5bb04ba23e5f5de65da07c3a9368ffe19121e7a6c6"
  },
  "Date": 1539008518,
  "Signature": "0x19074094d44fc77bc020d6c51c2e3f71fb45ede33b05202553d785cfce7d702411b98a4d0980d35383dfbe1d5b9779ee3b8f6295c27969bcf45156cdf6382b6201"
}
`;
let proofOfClaim = JSON.parse(proofOfClaimStr);
let verified = iden3.claim.checkProofOfClaim(proofOfClaim, 140);
// verified === true
```

### Merkletree

#### Merkle tree initialization
Three parameters as an inputs:
- db --> where to store key-value merkle tree nodes
- numLevels --> number of levels of the merkle tree
- idaddr --> used as key prefix at the time to store key nodes
```js
// new database
const db = new iden3.Db();
// hardcoded id address for multi identity purposes
const idaddr = "";
// number of merkle tree levels
const numLevels = 140;
// new merkle tree class instance
let mt = new iden3.merkleTree.MerkleTree(db,numLevels,idaddr);
```

#### Add claim
Add a leaf into the merkle tree. Note the leaf object structure containing `data` and `indexLength` in order to compute total hash and index hash
```js
// Create data leaf structure
let leaf = {
        data: Buffer.from('this is a test leaf'),
        indexLength: 15
      };

// Add leaf to the merkle tree
mt.addClaim(leaf);
```
#### Get leaf data by hash Index
Look for a index leaf on the merkle tree ans retrieves its data
```js
// compute hash index of the leaf
const hashIndex = iden3.utils.hashBytes(leaf.data.slice(0, leaf.indexLength));
// retrieve data of the leaf
let dataLeaf = mt.getClaimByHi(hashIndex);
```

#### Generate Proof
Generates an array with all the siblings needed in order to proof that a certain leaf is on a merkle tree.
```js
// get leafProof for a given leaf index
const leafProof = mt.generateProof(hashIndex);
// code `leafProof` into a string
let leafProofHex = iden3.utils.bytesToHex(leafProof);
```

#### CheckProof
Checks the `Merkle Proof` of a `Leaf`.
##### Proof-of-existence
```js
// retrieve merkle tree root and code it into a string
let rootHex = iden3.utils.bytesToHex(mt.root);
// code hash index into a string
let hashIndexHex = iden3.utils.bytesToHex(hashIndex);
// compute total hash of the leaf and code it into a string
let hashTotalHex = iden3.utils.bytesToHex(iden3.utils.hashBytes(leaf.data));
// check if a leaf is on the merkle tree
let verified = iden3.merkleTree.checkProof(rootHex, leafProofHex, hashIndexHex, hashTotalHex, 140);
```
##### Proof-of-non-existence
Generates `leafProof` of a leaf that is not on the merkle tree and check if it is on the merkle tree.
```js
// create leaf data structure
let leaf2 = {
        data: Buffer.from('this is a second test leaf'),
        indexLength: 15
      }
// compute hash index
const hashIndex2 = iden3.utils.hashBytes(leaf2.data.slice(0, leaf2.indexLength));
// generate leaf proof
const profLeaf2 = mt.generateProof(hashIndex2);
// code leaf proof into a string
let profLeaf2Hex = iden3.utils.bytesToHex(profLeaf2);
// code hash index into a string
let hashIndex2Hex = iden3.utils.bytesToHex(hashIndex2);
// compute total hash index and code it into a string
let hashTotal2Hex = iden3.utils.bytesToHex(iden3.utils.hashBytes(leaf2.data)); 
// check if a leaf is on the merkle tree
let verifiedRandom = iden3.merkleTree.checkProof(rootHex, profLeaf2Hex, hashIndex2Hex, hashTotal2Hex, 140);
```

### Utils
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

#### relay.genericClaim
Creates a new AuthorizeKSignClaim, signs it, and sends it to the Relay.
```js
relay.genericClaim(id.kc, ksign, 'iden3.io', 'default', 'data of the claim').then(res => {
  // console.log('res.data', res.data);
  expect(res.status).to.be.equal(200);
});
```

#### relay.authorizeKSignClaim
Creates a new authorizeKSignClaim, signs it, and sends it to the Relay.
```js
relay.authorizeKSignClaim(id.kc, keyid, kSign.addressHex(), 'appToAuthName', 'authz', 1535208350, 1535208350).then(res => {
  // console.log('res.data', res.data);
  expect(res.status).to.be.equal(200);
});
```

#### relay.postClaim
Sends to the Relay a signed Claim.
```js
relay.postClaim(idaddr, bytesSignedMsg)
  .then(res => {
    console.log('res.data', res.data);
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


### GET relay.getID
```js
relay.getID('0x46b57a3f315f99a6de39406310f5bd0db03326c1')
  .then(res => {
    console.log('res.data', res.data);
  });
```
Output:
```js
{
  IDAddr: '0x46b57a3f315f99a6de39406310f5bd0db03326c1',
  LocalDb: {
    Operational: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
    Relayer: '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c',
    Recoverer: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
    Revokator: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
    Impl: '0x2623ed1533d47d56f912300ae40f83b9370cead6'
  },
  Onchain: null
}
```



#### relay.resolveName
```js
relay.resolveName('username@iden3.io')
  .then(res => {
    console.log('res.data', res.data);
  });
```

Output:
```js
{
  claim: '0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074b7ae3d3a2056c54f48763999f3ff99caffaaba3bab58cae900000080000000008a440962fb17f0fe928a3d930137743fe63b8f4c0ce5a5da63991310103d9aef3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f',
  ethID: '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f'
}
```

### Auth
```js
// once have the QR data scanned, or the hex QR data copied
let qrJson = iden3.auth.parseQRhex(qrHex);
let qrKSign = iden3.utils.addrFromSig(qrJson.challenge, qrJson.signature);
// perform the AuthorizeKSignClaim over the qrKSign
id.authorizeKSignClaim(kc, id.keyOperational, qrKSign, 'appToAuthName', 'authz', unixtimeFrom, unixtimeUntil).then(res => {
  let ksignProof = res.data.proofOfClaim;

  // send the challenge, signature, KSign, and KSignProof to the qr url, that is the url of the backend of the centralized auth
  iden3.auth.resolv(qrJson.url, id.keyOperational, qrJson.challenge, qrJson.signature, qrKSign, ksignProof).then(res => {
    alert('centralized auth success, the website will refresh with the jwt');
  })
  .catch(function (error) {
    alert(error);
  });
})
.catch(function (error) {
  alert(error);
});
```

## Centralized Apps integration
The following instructions are for centralized apps, to integrate the iden3 system for authentication.

Once having a `centrauth` backend running ( https://github.com/iden3/go-iden3 ).

Include the `iden3js` library:
```js
const iden3 = require('iden3');
```

Or in the html include:
```html
<script src="iden3js-bundle.js"></script>
```

Add in the html the div that will contain the QR:
```html
<div id="qrcodediv"></div>

<!-- and optionally, the textarea to place the qr data in hex format -->
<textarea id="qrHex" rows="4" cols="30" readonly="readonly"></textarea>
```


In the js:
```js
let passphrase = 'this is a test passphrase';
const authurl = 'http://IPcentrauth:5000';
const authwsurl = 'ws://IPcentrauth:5000';

let kc = new iden3.KeyContainer('localstorage');
kc.unlock(passphrase);

let ksign = kc.generateKey();

let auth = new iden3.Auth(kc, ksign, authurl, authwsurl, function(authData) {
  // callback that will be called when the websocket gets the token, after the backend checks the authentication (challenge, signature, KSign, KSignProof, etc)
  alert('✔️ Logged in');
  /*
    authData = {
      "success": true,
      "token": "xxxxxxxx"
    }
  */
});
auth.printQr('qrcodediv');

let qrHex = auth.qrHex(); // optional, to show the qr hex data
document.getElementById("qrHex").value = qrHex; // optional, to show the qr hex data
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
