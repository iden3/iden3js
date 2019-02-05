const snarkjs = require('snarkjs');
const iden3 = require('../index');
const helpers = require('../src/sparse-merkle-tree/sparse-merkle-tree-utils');

const { bigInt } = snarkjs;

// New database
const db = new iden3.Db();
// Hardcoded id address for multi identity purposes
const idAddr = '0xq5soghj264eax651ghq1651485ccaxas98461251d5f1sdf6c51c5d1c6sd1c651';
// New merkle tree class instance
console.log('Create Merkle Tree');
const mt = new iden3.sparseMerkleTree.SparseMerkleTree(db, idAddr);

// Add leaf
console.log('Add leaf');
// Create data leaf structure
const leaf = [bigInt(12), bigInt(45), bigInt(78), bigInt(41)];
// Add leaf to the merkle tree
mt.addClaim(leaf);

// Get leaf data by hash Index
console.log('Get leaf data');
// Retrieve data of the leaf
const leafData = mt.getClaimByHi(leaf.slice(2));

// Generate Proof
console.log('Generate proof');
// Get leafProof for a given leaf index
const leafProof = mt.generateProof(leaf.slice(2));
// Code `leafProof` into a hexadecimal string
const leafProofHex = iden3.utils.bytesToHex(leafProof);

// CheckProof
console.log('Check proof');
// Proof-of-existence
console.log('Proof-of-existence');
// Retrieve merkle tree root and code it into a string
const rootHex = iden3.utils.bytesToHex(mt.root);
// Code hash index into a hexadecimal string
// Compute total hash of the leaf and code it into an hexadecimal string
const hashes = iden3.sparseMerkleTree.getHiHv(leaf);
const hiHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[0]));
const hvHex = iden3.utils.bytesToHex(helpers.bigIntToBuffer(hashes[1]));
// Check if a leaf is on the merkle tree
const verified = iden3.sparseMerkleTree.checkProof(rootHex, leafProofHex, hiHex, hvHex);
console.log(verified);

// CheckProof
console.log('Check proof');
// Proof-of-non-existence
console.log('Proof-of-non-existence');
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
console.log(verified2);
