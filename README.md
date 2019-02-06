# iden3js

Javascript client library of the iden3 system.

[![Build Status](https://travis-ci.org/iden3/iden3js.svg?branch=master)](https://travis-ci.org/iden3/iden3js)

## Install
```
npm install --save iden3
```
https://www.npmjs.com/package/iden3

## Basic usage
```js
// import iden3js
const iden3 = require('iden3');

// Simulate local storage locally
if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./tmp');
}

// new database
const db = new iden3.Db();
// new key container using localStorage
const keyContainer = new iden3.KeyContainer('localStorage', db);

// unlock the KeyContainer for the next 30 seconds
let passphrase = 'pass';
keyContainer.unlock(passphrase);

// generate master seed
const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
keyContainer.generateMasterSeed(mnemonic);

// Generate keys for first identity
const keys  = keyContainer.createKeys();

/*
  keys: [
    '0xc7d89fe96acdb257b434bf580b8e6eb677d445a9',
    '0x03c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff57833',
    '0xf3c9f94e4eaffef676d4fd3b4fc2732044caea91',
    '0xb07079bd6238fa845dc77bbce3ec2edf98ffe735'
  ];
*/
// It should be noted that 'keys' are in form of ethereum addresses except
// key[1] that is a pubic key in its compressed form
let keyAddressOp = keys[0];
let keyPublicOp = keys[1];
let keyRecover = keys[2];
let keyRevoke = keys[3];

// For more info and details about mnemonic, see section Usage > KeyContainer

// create a new relay object
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/v0.1';
const relay = new iden3.Relay(relayUrl);

// create a new id object
let id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, 0);

// generates the counterfactoual contract through the relay, get the identity address as response
let proofOfKsign = {};

console.log('Create Identity');
id.createID()
  .then((createIdRes) => {
    // Successfull create identity api call to relay
    console.log(createIdRes.idAddr); // Identity counterfactoual address
    console.log(createIdRes.proofOfClaim); // Proof of claim regarding authorization of key public operational
    proofOfKsign = createIdRes.proofOfClaim;

    console.log('Create and authorize new key for address');
    // generate new key from identity and issue a claim to relay in order to authorize new key
    const keyLabel = 'testKey';
    const newKey = id.createKey(keyContainer, keyLabel, true);
    id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, newKey)
      .then((authRes) => {
        proofOfKSign = authRes.data.proofOfClaim;
        console.log(proofOfKSign);
      })
    .catch((error) => {
      console.error(error.message);
    });

    console.log('Bind label to an identity');
    // bind the identity address to a label. It send required data to name-resolver service and name-resolver issue a claim 'assignName' binding identity address with label
    const name = 'testName';
    id.bindID(keyContainer, name)
      .then( (bindRes) => {
        console.log(bindRes.data);
        // request idenity address to name-resolver ( currently name-resolver service is inside relay) from a given label
        relay.resolveName(`${name}@iden3.io`)
          .then((resolveRes) => {
            const idAddress = resolveRes.data.ethAddr;
            console.log(`${name}@iden3.io associated with addres:` + idAddress);
          })
          .catch((error) => {
            console.error(error.message);
          });
      })
      .catch((error) => {
        console.error(error.message);
      });

    console.log('Deploy identity smart contract');
    // creates identity smart contract on the ethereum blockchain testnet 
    id.deployID()
      .then((deployIdRes) => {
        // Successfull deploy identity api call to relay
        console.log(deployIdRes.status);
      })
      .catch(() => {
        // If identity is already deployed, throws an error
        console.log('Identity already deployed');
      });
  })
  .catch((error) => {
    console.error(error.message);
  });
```
Example can be found in [`iden3-basic-usage.example.js`](https://github.com/iden3/iden3js/blob/master/examples/iden3-basic-usage.example.js)

## Centralized login
In the next links, one can be found an example of `iden3` implementation as well as the login protocol explained in detail
### Login protocol documentation
https://github.com/iden3/iden3js/blob/master/src/protocols/README.md
### Demo centralized application
https://github.com/iden3/centralized-login-demo

## Usage

### Import
```js
const iden3 = require('iden3');
```

### KeyContainer

- new KeyContainer using localStorage
  ```js
  // new key container
  // new database
  const db = new iden3.Db();
  let keyContainer = new iden3.KeyContainer('localStorage');

  ```
- usage:
```js
// unlock the KeyContainer for the next 30 seconds
let passphrase = 'pass';
keyContainer.unlock(passphrase);

// generate master seed
const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
keyContainer.generateMasterSeed(mnemonic);

// Also, master seed can be generated randomly if no mnemonic is specified
// keyContainer.generateMasterSeed();

// functions above stores seed mnemonic into local storage
// it can be retrieved through:
const mnemonicDb = keyContainer.getMasterSeed();

// Generate keys for first identity
const keys = keyContainer.createKeys();
/*
  keys: [
    '0xc7d89fe96acdb257b434bf580b8e6eb677d445a9',
    '0x03c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff57833',
    '0xf3c9f94e4eaffef676d4fd3b4fc2732044caea91',
    '0xb07079bd6238fa845dc77bbce3ec2edf98ffe735'
  ];
*/
// Each time 'keyContainer.createKeys()' is called, a new set of keys for an identity is created

// Retrieve key seed and its current derivation path
const { keySeed, pathKey } = keyContainer.getKeySeed();

// It should be noted that 'keys' are in form of ethereum addresses except
// key[1] that is a pubic key in its compressed form
const keyAddressOp = keys[0];
const keyPublicOp = keys[1];
const keyRecover = keys[2];
const keyRevoke = keys[3];
```

### Identity
```js
const db = new iden3.Db();
const keyContainer = new iden3.KeyContainer('localStorage', db);
const passphrase = 'pass';
keyContainer.unlock(passphrase);

// new relay
const relay = new iden3.Relay('http://127.0.0.1:8000/api/v0.1');
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relay = new iden3.Relay(relayUrl);

// create identity object with a set of keys
const keyPath = 0;
const id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, keyPath);
```
#### id.createKey
```js
// Create new key for this identity and bind it to a label
const labelKey = 'test key'
const loginKey = id.createKey(keyContainer, labelKey);
```
#### id.getKeys
```js
// Retrieve all keys that have been created for this identity
const keysIdentity = id.getKeys();
```
#### id.createID
Creates the counterfactual contract through the `Relay`, and gets the identity address
When an identity is created, all its keys are automatically stored
```js
id.createID().then(res => {
  console.log(res.data);
});
```

- Output:
```js
// Return object: - idAddr: Address identity identifier
//                - proofOfClam: Structure of the claim emitted by the relay authorizing its key public operational
{
  idAddr,
  proofOfClaim
}
```
#### id.deployID
Deploys the counterfactual smart contract of identity to the blockchain.
```js
id.deployID().then(res => {
  console.log(res.data);
});
```

- Output:
```js
// Return object: - idAddr: Address identity identifier
//                - tx: transaction identifier of the deploying identity smart contract on the blockchain
{
  idAddr,
  tx
}
```

#### id.getID //TODO: move to relay section
```js
relay.getID(id.idAddr).then((res) => {
  console.log(res.data);
});
```
- Output:
```js
// Return object: - idAddr: Address identity identifier
//                - localDb: contins necessary informatin to create counterfactoual
//                - onchain: information regarding smart ntract deployed on the blockchain
{
  idAddr,
  localDb,
  onchain,
}
```

#### id.bindID
Vinculates a label to an identity.
It sends required data to name-resolver service and name-resolver issue a claim 'assignName' binding identity address with a label

```js
const name = 'testName';
id.bindID(kc, name).then(res => {
  console.log(res.data);
});
```

- Output:
```js
// Return object: - claimasigname: hexadecimal representation of claim data
//                - ethAddr: ethereum addres to bind to the label
//                - name: label binded to the ethereum address
//                - proofOfClaimAssignName: full proof of existance of the claim issued by the name-resolved
{
  claimasigname,
  ethAddr,
  name,
  proofOfClaimAssignName
}
```

#### id.authorizeKSignSecp256k1
```js
// generate new key from identity and add issue a claim to relay in order to authorize new key
const keyLabel = 'testKey';
const newKey = id.createKey(keyContainer, keyLabel, true);

// send claim to relay signed by operational key in order to authorize a second key 'newKey'
id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, newKey)
  .then((res) => {
    console.error(res.data);
  });
});
```
- Output:
```js
// Return object: - proofOfClaim: full proof of existence of the claim issued by the relay
{
  proofOfClaim
}
```

### Claims
 - Generic claim representation: `Entry`
 - Claim Types:
   - Basic
   - Authorize Key to sign
   - Set root key
   - Assign name
   - Authorize key to sign (type key is secp256k1
   
#### Entry
```js
/**
 * Generic representation of claim elements
 * Entry element structure is as follows: |element 0|element 1|element 2|element 3|
 * Each element contains 253 useful bits enclosed on a 256 bits Buffer
 */
let entry = new iden3.Claim.Entry();
```
- Entry Methods:
```js
entry.hi(); // Hash index is calculated from: |element 1|element 0|
entry.hv(); // Hash value is calculated from: |element 3|element 2|
entry.toHexadecimal(); // Concats all the elements of the entry and parse it into an hexadecimal string
entry.fromHexadecimal(); // String deserialization into entry element structure
```

#### Basic claim
```js
const versionExample = 1;
const indexExample = Buffer.alloc(50);
indexExample.fill(41, 0, 1);
indexExample.fill(42, 1, 49);
indexExample.fill(43, 49, 50);
const dataExample = Buffer.alloc(62);
dataExample.fill(86, 0, 1);
dataExample.fill(88, 1, 61);
dataExample.fill(89, 61, 62);
// new basic claim
const claimBasic = new iden3.Claim.Factory(iden3.constants.CLAIMS.BASIC.ID, {
      version: versionExample, index: utils.bytesToHex(indexExample), extraData: utils.bytesToHex(dataExample),
    });
/*
claim.structure:
{
  claimType,
  version,
  index,
  extraData,
};
 * Basic entry representation is as follows:
 * |element 3|: |empty|index[0]|version|claim type| - |1 byte|19 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|index[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty|data[0]| - |1 bytes|31 bytes|
 * |element 0|: |empty|data[1]| - |1 bytes|31 bytes|
*/
// methods of the Basic claim
claimBasic.createEntry(); // Code raw data claim object into an entry claim object
// parse Entry into Basic claim
let entry = new Entry();
entry.fromHexadecimal(leaf); // Leaf is an hexadecimal representation of an Entry
let claimBasicParsed = iden3.claim.claimUtils.newClaimFromEntry(entry);
```

##### Authorize KSign claim
```js
const versionExample = 1;
const signExample = true;
const ayExample = '0x0505050505050505050505050505050505050505050505050505050505050506';
// new authorize ksign claim
const claimAuthorizeKSign = new Claim.Factory(iden3.constants.CLAIMS.AUTHORIZE_KSIGN.ID, {
  version: versionExample, sign: signExample, ay: ayExample,
});
/*
claim.structure:
{
  claimType,
  version,
  sign,
  ay,
};
 * Authorized Ksign element representation is as follows:
 * |element 3|: |empty|sign|version|claim type| - |19 bytes|1 bytes|4 bytes|8 bytes|
 * |element 2|: |Ay| - |32 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
// methods of the authorize Sign claim
claimAuthorizeKSign.createEntry(); // Code raw data claim object into an entry claim object
// parse Entry into authorize kSign claim
let entry = new Entry();
entry.fromHexadecimal(leaf); // Leaf is an hexadecimal representation of an Entry
let claimBasicParsed = iden3.claim.claimUtils.newClaimFromEntry(entry);
```

##### Set root key claim
```js
const versionExample = 1;
const eraExample = 1;
const idExample = '0x393939393939393939393939393939393939393A';
const rootKeyExample = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c';
// new set root key ksign claim
const claimSetRootKey = new Claim.Factory(iden3.constants.CLAIMS.SET_ROOT_KEY.ID, {
  version: versionExample, era: eraExample, id: idExample, rootKey: rootKeyExample,
});
/*
claim.structure:
{
  claimType,
  version,
  er,
  id,
  rootKey,
};
 * Set root key name entry representation is as follows:
 * |element 3|: |empty|era|version|claim type| - |16 bytes|4 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|identity| - |12 bytes|20 bytes|
 * |element 1|: |root key| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
// methods of the set root key claim
claimSetRootKey.createEntry(); // Code raw data claim object into an entry claim object
// parse Entry into set root key claim
let entry = new Entry();
entry.fromHexadecimal(leaf); // Leaf is an hexadecimal representation of an Entry
let claimBasicParsed = iden3.claim.claimUtils.newClaimFromEntry(entry);
```

##### Assign name claim
```js
const versionExample = 1;
const nameExample = 'example.iden3.eth';
const idExample = '0x393939393939393939393939393939393939393A';
// new set root key ksign claim
const claimAssignName = new Claim.Factory(CONSTANTS.CLAIMS.ASSIGN_NAME.ID, {
  version: versionExample, hashName: nameExample, id: idExample 
});
/*
claim.structure:
{
  claimType,
  version,
  hashName,
  id,
};
 * Assign name entry representation is as follows:
 * |element 3|: |empty|version|claim type| - |20 bytes|4 bytes|8 bytes|
 * |element 2|: |hash name| - |32 bytes|
 * |element 1|: |empty|identity| - |12 bytes|20 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
// methods of the set root key claim
claimAssignName.createEntry(); // Code raw data claim object into an entry claim object
// parse Entry into set root key claim
let entry = new Entry();
entry.fromHexadecimal(leaf); // Leaf is an hexadecimal representation of an Entry
let claimBasicParsed = iden3.claim.claimUtils.newClaimFromEntry(entry);
```

##### Assign name claim
```js
const versionExample = 1;
const pubKeyCompressedExample = '0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d593A';
// new authorize kSign secp256k1 claim
const claimAuthKSignSecp256k1 = new Claim.Factory(CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.ID, {
  version: versionExample, pubKeyCompressed: utils.bytesToHex(pubKeyCompressedExample),
});
/*
claim.structure:
{
  claimType,
  version,
  pubKeyCompressed,
};
 * Authorized KsignSecp256k1 element representation is as follows:
 * |element 3|: |empty|public key[0]|version|claim type| - |18 bytes|2 bytes|4 bytes|8 bytes|
 * |element 2|: |empty|public key[1]| - |1 bytes|31 bytes|
 * |element 1|: |empty| - |32 bytes|
 * |element 0|: |empty| - |32 bytes|
 */
// methods of the authorize ksign secp256k1
claimAuthKSignSecp256k1.createEntry(); // Code raw data claim object into an entry claim object
// parse Entry into set root key claim
let entry = new Entry();
entry.fromHexadecimal(leaf); // Leaf is an hexadecimal representation of an Entry
let claimBasicParsed = iden3.claim.claimUtils.newClaimFromEntry(entry);
```

#### checkProofOfClaim //TODO: proofs.js
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

### Sparse merkletree

#### Merkle tree initialization
Three parameters as an inputs:
- db --> where to store key-value merkle tree nodes
- idaddr --> used as key prefix at the time to store key nodes
```js
// New database
const db = new iden3.Db();
// Hardcoded id address for multi identity purposes
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';
// New merkle tree class instance
const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);
```

#### Add claim
Add a leaf into the sparse merkle tree. Note the leaf object structure containing 4 `bigInt` fields
```js
// Add leaf
// Create data leaf structure
const leaf = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
// Add leaf to the merkle tree
mt.addClaim(leaf);
```
#### Get leaf data by hash Index
Look for a index leaf on the merkle tree ans retrieves its data
```js
// Get leaf data by hash Index
// Retrieve data of the leaf
const leafData = mt.getClaimByHi(leaf.slice(2));
```

#### Generate Proof
Generates an array with all the siblings needed in order to proof that a certain leaf is on a merkle tree.
```js
// Get leafProof for a given leaf index
const leafProof = mt.generateProof(leaf.slice(2));
// Code `leafProof` into a hexadecimal string
const leafProofHex = iden3.utils.bytesToHex(leafProof);
```

#### CheckProof
Checks the `Merkle Proof` of a `Leaf`.
##### Proof-of-existence
```js
// CheckProof
// Proof-of-existencee
// Retrieve merkle tree root and code it into a string
const rootHex = iden3.utils.bytesToHex(mt.root);
// Code hash index into a hexadecimal string
// Compute total hash of the leaf and code it into an hexadecimal string
const hashes = iden3.sparseMerkleTree.getHiHv(leaf);
const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
// Check if a leaf is on the merkle tree
const verified = iden3.sparseMerkleTree.checkProof(rootHex, leafProofHex, hiHex, hvHex);
```
##### Proof-of-non-existence
Generates `leafProof` of a leaf that is not on the merkle tree and check if it is on the merkle tree.
```js
// CheckProof
// Proof-of-non-existence
// create leaf2 data structure
const leaf2 = [bigInt(1), bigInt(2), bigInt(3), bigInt(4)];
// Code hash index into a hexadecimal string
// Compute total hash of the leaf and code it into an hexadecimal string
const hashes2 = iden3.sparseMerkleTree.getHiHv(leaf2);
const hiHex2 = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes2[0]));
const hvHex2 = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes2[1]));
// Get leafProof for a given leaf index
const leafProof2 = mt.generateProof(leaf2.slice(2));
// Code `leafProof` into a hexadecimal string
const leafProofHex2 = iden3.utils.bytesToHex(leafProof2);
// Check if a leaf is on the merkle tree
const verified2 = iden3.sparseMerkleTree.checkProof(rootHex, leafProofHex2, hiHex2, hvHex2);
```
The complete example can be found in [`sparse-merkle-tree.example.js`](https://github.com/iden3/iden3js/blob/master/examples/sparse-merkle-tree.example.js)


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

// TODO: update calls to relay
// TODO: Split Reay / Name-Resolver
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
  ethAddr: '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f'
}
```

## Tests
To run unitary test:
```js
npm run test:unit
```
To run integration test, needs to have a running [Relay](https://github.com/iden3/go-iden3) node.
```
npm run test:int
```
To run all test, needs to have a running [Relay](https://github.com/iden3/go-iden3) node.
```
npm run test:all
```

## Browserify bundle
To generate the browserify bundle:
```
npm run browserify
```

### WARNING
All code here is experimental and WIP

## License
iden3js is part of the iden3 project copyright 2018 0kims association and published with GPL-3 license, please check the LICENSE file for more details.
