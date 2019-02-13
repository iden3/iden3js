# iden3js

Javascript client library of the iden3 system.

[![Build Status](https://travis-ci.org/iden3/iden3js.svg?branch=master)](https://travis-ci.org/iden3/iden3js)

## Install
```
npm install --save @iden3/iden3
```
https://www.npmjs.com/package/@iden3/iden3

## Basic usage
```js
// import iden3js
const iden3 = require('@iden3/iden3');

// Simulate local storage locally if no browser is used
// if (typeof localStorage === 'undefined' || localStorage === null) {
//   const LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./tmp');
// }

// It should be noted that if no babel is installed on `package.json` dependencies,
// next dependencies should be add to `dependecies` section on `package.json`:
// "babel-plugin-transform-class-properties": "^6.24.1",
// "babel-plugin-transform-runtime": "^6.23.0",


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
const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const relay = new iden3.Relay(relayUrl);

// create a new id object
let id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, 0);

// generates the counterfactoual contract through the relay, get the identity address as response
let proofKsign = {};

console.log('Create Identity');
id.createID()
  .then((createIdRes) => {
    // Successfull create identity api call to relay
    console.log(createIdRes.idAddr); // Identity counterfactoual address
    proofKsign = createIdRes.proofClaim;
    console.log(proofKsign); // Proof of claim regarding authorization of key public operational

    console.log('Create and authorize new key for address');
    // generate new key from identity and issue a claim to relay in order to authorize new key
    const keyLabel = 'testKey';
    const newKey = id.createKey(keyContainer, keyLabel, true);
    id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, newKey)
      .then((authRes) => {
        proofKSign = authRes.data.proofClaim;
        console.log(proofKSign);
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
            const idAddr = resolveRes.data.idAddr;
            console.log(`${name}@iden3.io associated with addres: ` + idAddr);
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
const relay = new iden3.Relay('http://127.0.0.1:8000/api/unstable');
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relay = new iden3.Relay(relayUrl);

// create identity object with a set of keys
const keyPath = 0;
const id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, keyPath);
```
#### id.createID
Creates the counterfactual contract through the `Relay`, and gets the identity address
When an identity is created, all its keys are automatically stored
```js
id.createID().then(res => {
  console.log(res.idAddr);
  console.log(res.proofClaim);
});
```
```js
// Return : - idAddr: Address identity identifier
//          - proofOfClam: Structure of the claim emitted by the relay authorizing its key public operational
idAddr = 0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22;
proofClaim = {
  date: 1549531663,
  leaf:'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff50000000000000000000000000000000000007833000000000000000000000004',
  proofs: [{
    aux: {
      era: 0,
      idAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
      version: 0
    }
    mtp0: '0000000000000000000000000000000000000000000000000000000000000000',
    mtp1: '030000000000000000000000000000000000000000000000000000000000000028f8267fb21e8ce0cdd9888a6e532764eb8d52dd6c1e354157c78b7ea281ce801541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed',
    root: '1d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c3922',
  } , {
    aux: null
    mtp0: '0000000000000000000000000000000000000000000000000000000000000000',
    mtp1: '0300000000000000000000000000000000000000000000000000000000000000182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
    root: '083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f8199',

  }], 
  signature:'440ec709297ecb6a7f7a200719c29d96025a893aef7318cebdcec401e3c8b3b711358f5a3c14394dc120b067ade86d7eca0c79be580d35934cc36dc246be6ec000',
}
```
#### id.createKey
```js
// Create new key for this identity and bind it to a label
const labelKey = 'test key'
const loginKey = id.createKey(keyContainer, labelKey);
console.log(loginKey);
```

```js
// Return : New key created
loginKey = '0xaac4ed37a11e6a9170cb19a6e558913dc3efa6a7';
```
#### id.getKeys
```js
// Retrieve all keys that have been created for this identity
const keysIdentity = id.getKeys();
console.log(keysIdentity);
```
```js
// Return : Object containing all the keys associated with the identity
{
  operationalPub:"0x03c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff57833",
  recover:"0xf3c9f94e4eaffef676d4fd3b4fc2732044caea91",
  revoke:"0xb07079bd6238fa845dc77bbce3ec2edf98ffe735",
  test key:"0xaac4ed37a11e6a9170cb19a6e558913dc3efa6a7",
}
```

#### id.deployID
Deploys the counterfactual smart contract of identity to the blockchain.
```js
id.deployID().then(res => {
  console.log(res.data);
});
// Return object: - idAddr: Address identity identifier
//                - tx: transaction identifier of the deploying identity smart contract on the blockchain
```
#### id.bindID
Vinculates a label to an identity.
It sends required data to name-resolver service and name-resolver issue a claim 'assignName' binding identity address with a label

```js
const name = 'testName';
id.bindID(kc, name).then(bindRes => {
  console.log(bindRes.data);
});
```

- Output:
```js
// Return object: - claimAssigName: hexadecimal representation of claim data
//                - idAddr: ethereum addres to bind to the label
//                - name: label binded to the ethereum address
//                - proofClaimAssignName: full proof of existance of the claim issued by the name-resolved
{
  claimAssigName: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
  idAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22', 
  name: 'testName',
  proofClaimAssignName: {
    date:1549532610,
    leaf:'00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
    proofs:[{
      aux: null,
      mtp0:'0001000000000000000000000000000000000000000000000000000000000001083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f8199',
      mtp1:'03010000000000000000000000000000000000000000000000000000000000010fef40cc16896de64be5a0f827799555344fd3d9aade9b65d95ecfbcac3e5a73182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
      root:'1b6feefde6e76c1e9d98d30fa0993a7a7b35f5b2580a757c9a57ee383dc50b96',
    }],
    signature:'1e6d15ef907000937577aa06437ee2a1230713be20ff09d7628ce4dc6c902c11274f34d4ae0f9e9fc2e67cf21abe5da7f11748fc243f4013faa42e53e9c81e3e01',
  }
}
```

#### id.authorizeKSignSecp256k1
```js
// generate new key from identity and add issue a claim to relay in order to authorize new key
const keyLabel = 'testKey';
const newKey = id.createKey(keyContainer, keyLabel, true);

// send claim to relay signed by operational key in order to authorize a second key 'newKey'
id.authorizeKSignSecp256k1(keyContainer, id.keyOperationalPub, loginKey)
  .then((res) => {
    console.error(res.data);
  });
```
- Output:
```js
// Return object: - proofClaim: full proof of existence of the claim issued by the relay
proofClaim = {
  date: 1549534168,
  leaf:'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aac4ed37a11e6a9170cb19a6e558913dc3ef000000000000000000000000000000000000a6a7000000000000000000000004',
  proofs: [{
    aux: {
      era: 0,
      idAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
      version: 1
    }
    mtp0: '00010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c3922',
    mtp1: '03010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c39221c8bdcd862752abf2dd32d16c9c3acfa20ea93cecc64d169c4550ca3e9bca20b1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed',
    root: '21c6e1a81851f4017139ae8ddfbd5e894376fdd14c73cecf2a81939bae78595b',
  } , {
    aux: null
    mtp0: '0007000000000000000000000000000000000000000000000000000000000041083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f81990fef40cc16896de64be5a0f827799555344fd3d9aade9b65d95ecfbcac3e5a73',
    Mtp1: '0301000000000000000000000000000000000000000000000000000000000001081b6542453a651f2b0fea8b639a8823809f7fc032c051a644d1a8b559ba0322182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
    root: '1560e7b6983491305c6522c4227b98fbf26753b6a7fcb97ffb0ef7d98b271e99',

  }], 
  signature:'3cedbb3d6eab5ce9a1f8bb436a080f7ec5ede3526fdcfa094fee33cbbd414d0c6d41a6650f4fdda27a66d51d87d18b4cae0adbd695ccdb152dae65a998ba61f101',
}
```
### Claims
 - Generic claim representation: `Entry`
 - Claim Types:
   - Basic
   - Authorize Key to sign
   - Set root key
   - Assign name
   - Authorize key to sign secp256k1
   
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

#### checkProofOfClaim
This function checks the data structure of `proofOfClaim` and returns true if all the proofs are correct.
Internally, it usees the `iden3.sparseMerkleTree.checkProof()` function, for each one of the proofs that are contained inside `proofClaim` data object.

Checks the full `proof` of a `claim`. This means check the:
- `Merkle Proof` of the `claim`
- `Merkle Proof` of the non revocation `claim`
- `Merkle Proof` of the `claim` that the `Relay` have performed over the `identity` `Merkle Root` (this kind of claim is the `SetRootClaim`)
- `Merkle Proof` of the non revocation of the `SetRootClaim`

```js
let proofClaim = {
  date: 1549534168,
  leaf:'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aac4ed37a11e6a9170cb19a6e558913dc3ef000000000000000000000000000000000000a6a7000000000000000000000004',
  proofs: [{
    aux: {
      era: 0,
      idAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
      version: 1
    }
    mtp0: '00010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c3922',
    mtp1: '03010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c39221c8bdcd862752abf2dd32d16c9c3acfa20ea93cecc64d169c4550ca3e9bca20b1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed',
    root: '21c6e1a81851f4017139ae8ddfbd5e894376fdd14c73cecf2a81939bae78595b',
  } , {
    aux: null
    mtp0: '0007000000000000000000000000000000000000000000000000000000000041083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f81990fef40cc16896de64be5a0f827799555344fd3d9aade9b65d95ecfbcac3e5a73',
    mtp1: '0301000000000000000000000000000000000000000000000000000000000001081b6542453a651f2b0fea8b639a8823809f7fc032c051a644d1a8b559ba0322182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
    root: '1560e7b6983491305c6522c4227b98fbf26753b6a7fcb97ffb0ef7d98b271e99',

  }], 
  signature:'3cedbb3d6eab5ce9a1f8bb436a080f7ec5ede3526fdcfa094fee33cbbd414d0c6d41a6650f4fdda27a66d51d87d18b4cae0adbd695ccdb152dae65a998ba61f101',
}
let proofClaim = JSON.parse(proofClaim);
let verified = iden3.protocols.verifyProofClaimFull(proofClaim, relayAddr);
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
### Relay http
Connectors to interact with the relay API REST.

#### Create Relay object
```js
// new relay
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relay = new iden3.Relay('http://127.0.0.1:8000/api/unstable');
```
#### relay.getID
```js
relay.getID(id.idAddr).then((res) => {
  console.log(res.data);
});
```
- Output:
```js
// Return object: - IdAddr: Address identity identifier
//                - LocalDb: contins necessary informatin to create counterfactoual
//                - Onchain: information regarding smart contract deployed on the blockchain
{
  IdAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
  LocalDb: {
    impl:'0x66d0c2f85f1b717168cbb508afd1c46e07227130',
    operational:'0xc7d89fe96acdb257b434bf580b8e6eb677d445a9',
    operationalPk:'0x03c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff57833',
    recoverer:'0xf3c9f94e4eaffef676d4fd3b4fc2732044caea91',
    relayer:'0xe0fbce58cfaa72812103f003adce3f284fe5fc7c',
    revokator:'0xb07079bd6238fa845dc77bbce3ec2edf98ffe735',
  },
  onchain: {
    Codehash:'0x4fec321ffcfdd48cdbe4d02553acb18ddb04cd5c6a78bcaf86e87834b1f3d0ee',
    Impl:'0x66d0c2f85f1b717168cbb508afd1c46e07227130',
    LastNonce:0,
    Recoverer:'0xf3c9f94e4eaffef676d4fd3b4fc2732044caea91',
    RecovererProp:'0x0000000000000000000000000000000000000000',
    Relay:'0xe0fbce58cfaa72812103f003adce3f284fe5fc7c',
    Revoker:'0xb07079bd6238fa845dc77bbce3ec2edf98ffe735',
  },
}
```
#### relay.getRelayRoot
```js
relay.getRelayRoot()
  .then(res => {
    console.log('res.data', res.data);
  });
```

- Output:
```js
// Return object: - contractRoot: Address of the relay smart contract
//                - root: Current root of the relay merkle tree
{
  contractRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
  root: '0x1560e7b6983491305c6522c4227b98fbf26753b6a7fcb97ffb0ef7d98b271e99'
}
```

#### relay.getIDRoot
```js
relay.getIDRoot(id.kc.addressHex())
  .then(res => {
    console.log('res.data', res.data);
  });
```
- Output:
```js
// Return object: - idRoot: Root of the identity merkle tree
//                - proofIdRoot: Proof of SetRootClaim that relay merkle tree contains identity root merkle tree
//                - root: Root of the relay merkle tree
{
  idRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
  proofIdRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
  root: '0x0000000000000000000000000000000000000000000000000000000000000000'
}
```
#### relay.getClaimByHi
```js
let leaf = new iden3.claims.Entry();
leaf.fromHexadecimal(proofClaim.Leaf);

relay.getClaimByHi(id.idAddr, iden.utils.bytesToHex(leaf.hi()))
  .then(res => {
    console.log('res.data', res.data);
  });
```
```js
// Return object: - proofOfClaim: Proof of claim for the claim asked
proofClaim = {
  date: 1549534168,
  leaf:'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aac4ed37a11e6a9170cb19a6e558913dc3ef000000000000000000000000000000000000a6a7000000000000000000000004',
  proofs: [{
    aux: {
      era: 0,
      idAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22',
      version: 1
    }
    mtp0: '00010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c3922',
    mtp1: '03010000000000000000000000000000000000000000000000000000000000011d9d41171c4b621ff279e2acb84d8ab45612fef53e37225bdf67e8ad761c39221c8bdcd862752abf2dd32d16c9c3acfa20ea93cecc64d169c4550ca3e9bca20b1541a6b5aa9bf7d9be3d5cb0bcc7cacbca26242016a0feebfc19c90f2224baed',
    root: '21c6e1a81851f4017139ae8ddfbd5e894376fdd14c73cecf2a81939bae78595b',
  } , {
    aux: null
    mtp0: '0007000000000000000000000000000000000000000000000000000000000041083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f81990fef40cc16896de64be5a0f827799555344fd3d9aade9b65d95ecfbcac3e5a73',
    mtp1: '0301000000000000000000000000000000000000000000000000000000000001081b6542453a651f2b0fea8b639a8823809f7fc032c051a644d1a8b559ba0322182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
    root: '1560e7b6983491305c6522c4227b98fbf26753b6a7fcb97ffb0ef7d98b271e99',

  }], 
  signature:'3cedbb3d6eab5ce9a1f8bb436a080f7ec5ede3526fdcfa094fee33cbbd414d0c6d41a6650f4fdda27a66d51d87d18b4cae0adbd695ccdb152dae65a998ba61f101',
}
```

#### relay.resolveName
```js
relay.resolveName('username@iden3.io')
  .then(res => {
    console.log('res.data', res.data);
  });
```

- Output:
```js
// Return object: - claim: Hexadecimal representation of the assign name claim
//                - idAddr: Ethereum address associated with the name asked
//                - proofOfClaimAssignName: Proof of the claim requested
{
  claim: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
  ethAddr: '0x7b471a1bdbd3b8ac98f3715507449f3a8e1f3b22'.
  proofOfClaimAssignName: {
    date: 1549539788,
    leaf: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b471a1bdbd3b8ac98f3715507449f3a8e1f3b22008c8efcda9e563cf153563941b60fc5ac88336fc58d361eb0888686fadb99760000000000000000000000000000000000000000000000000000000000000003',
    proofs:[{
      aux: null,
      mtp0: '0007000000000000000000000000000000000000000000000000000000000041083dbb7700313075a2b8fe34b0188ff44784e3dc60987ed9277b59fad48f8199200d11c36880f3f48060bc8f09855aeefc9bb1e1374556d02c3f059293df4abe',
      mtp1: '0301000000000000000000000000000000000000000000000000000000000001081b6542453a651f2b0fea8b639a8823809f7fc032c051a644d1a8b559ba0322182adc955c46e6629ac74027ded0c843c7c65e8c3c4f12f77add56500f9f402e25451237d9133b0f5c1386b7b822f382cb14c5fff612a913956ef5436fb6208a',
      root: '1560e7b6983491305c6522c4227b98fbf26753b6a7fcb97ffb0ef7d98b271e99',
    }]
    signature:'0b17f53111f890222d8139e0a400f9dbf900dabdc450759ac9ab19fb9f239f704d250cd3116b6f74905ffccd8754182d3de2e1fc4ac7a35b0db6fe660198422000',
  },
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

## Releases

Version compatibility

|     | iden3js | go-iden3 |
|-----|---------|----------|
| tag | v0.0.21 | v0.0.2   |

## License
iden3js is part of the iden3 project copyright 2018 0kims association and published with GPL-3 license, please check the LICENSE file for more details.
