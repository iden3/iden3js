const chai = require('chai');
const iden3 = require('../index');
const { expect } = chai;

// New database
const db = new iden3.Db();
// Hardcoded id address for multi identity purposes
const idaddr = '';
// Number of merkle tree levels
const numLevels = 140;
// New merkle tree class instance
console.log('Create Merkle Tree');
let mt = new iden3.merkleTree.MerkleTree(db,numLevels,idaddr);

// Add claim
console.log('Add Claim');
// Create data leaf structure
let leaf = {
        data: Buffer.from('this is a test leaf'),
        indexLength: 15
      };

// Add leaf to the merkle tree
mt.addClaim(leaf);

// Get leaf data by hash Index
console.log('Get leaf data');
// Compute hash index of the leaf
const hashIndex = iden3.utils.hashBytes(leaf.data.slice(0, leaf.indexLength));
// Retrieve data of the leaf
let dataLeaf = mt.getClaimByHi(hashIndex);

// Generate Proof
console.log('Generate proof');
// Get leafProof for a given leaf index
const leafProof = mt.generateProof(hashIndex);
// Code `leafProof` into a string
let leafProofHex = iden3.utils.bytesToHex(leafProof);

// CheckProof
console.log('Check proof');
// Proof-of-existence
console.log('Proof-of-existence');
// Retrieve merkle tree root and code it into a string
let rootHex = iden3.utils.bytesToHex(mt.root);
// Code hash index into a string
let hashIndexHex = iden3.utils.bytesToHex(hashIndex);
// Compute total hash of the leaf and code it into a string
let hashTotalHex = iden3.utils.bytesToHex(iden3.utils.hashBytes(leaf.data));
// Check if a leaf is on the merkle tree
let verified = iden3.merkleTree.checkProof(rootHex, leafProofHex, hashIndexHex, hashTotalHex, 140);
console.log(verified);

// Proof-of-non-existence
console.log('Proof-of-non-existence');
// create leaf data structure
let leaf2 = {
        data: Buffer.from('this is a second test leaf'),
        indexLength: 15
      }
// Compute hash index
const hashIndex2 = iden3.utils.hashBytes(leaf2.data.slice(0, leaf2.indexLength));
// Generate leaf proof
const proofLeaf2 = mt.generateProof(hashIndex2);
// Code leaf proof into a string
let proofLeaf2Hex = iden3.utils.bytesToHex(proofLeaf2);
// Code hash index into a string
let hashIndex2Hex = iden3.utils.bytesToHex(hashIndex2);
// Check if a leaf is on the merkle tree
let verified2 = iden3.merkleTree.checkProof(rootHex, proofLeaf2Hex, hashIndex2Hex, iden3.utils.bytesToHex(iden3.merkleTree.emptyNodeValue), 140);
console.log(verified2);