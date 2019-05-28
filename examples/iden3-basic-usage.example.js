// import iden3js
const iden3 = require('../index');

// new database
const db = new iden3.Db();
// new key container using localStorage
const keyContainer = new iden3.KeyContainer(db);
// unlock the KeyContainer for the next 30 seconds
const passphrase = 'pass';
keyContainer.unlock(passphrase);

// generate master seed
const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
keyContainer.generateMasterSeed(mnemonic);

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
// It should be noted that 'keys' are in form of ethereum addresses except
// key[1] that is a pubic key in its compressed form
const keyAddressOp = keys[0];
const keyPublicOp = keys[1];
const keyRecover = keys[2];
const keyRevoke = keys[3];

// For more info and details about mnemonic, see section Usage > KeyContainer

// create a new relay object
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const relay = new iden3.Relay(relayUrl);

// create a new id object
const id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, 0);

// generates the counterfactoual contract through the relay, get the identity address as response
let proofKsign = {};

// console.log('Create Identity');
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
        proofKsign = authRes.data.proofClaim;
        console.log(proofKsign);
      })
      .catch((error) => {
        console.error(error.message);
      });

    // console.log('Bind label to an identity');
    // bind the identity address to a label. It send required data to name-resolver service and name-resolver issue a claim 'assignName' binding identity address with label
    const name = 'testName';
    id.bindId(keyContainer, name)
      .then((bindRes) => {
        console.log(bindRes.data);
        // request idenity address to name-resolver ( currently name-resolver service is inside relay) from a given label
        relay.resolveName(`${name}@iden3.io`)
          .then((resolveRes) => {
            const idAddress = resolveRes.data.idAddr;
            console.log(`${name}@iden3.io associated with addres: ${idAddress}`);
          })
          .catch((error) => {
            console.error(error.message);
          });
      })
      .catch((error) => {
        console.error(error.message);
      });
  })
  .catch((error) => {
    console.error(error.message);
  });
