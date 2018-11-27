const utils = require('./utils');
const helpers = require('./merkle-tree-utils');
const CONSTANTS = require('./constants');

const emptyNodeValue = Buffer.alloc(32);

class MerkleTree {
  /**
  * Initiate merkle tree with a given number of levels
  * @param {Object} db - Database
  * @param {uint} numLevels - Number of levels of the merkle tree
  * @param {String} iaddr - adress of the identity
  */
  constructor(db,numLevels,idaddr){
      this.db = db;
      this.prefix = CONSTANTS.MTPREFIX + idaddr;
      this.numLevels = numLevels;
      this.numLayers = this.numLevels - 1;
      this.root = emptyNodeValue;
  }

  /**
  * Get the root of the merkle tree
  * @returns {Buffer} - Root of the merkle tree
  */
  getRoot(){
      return this.root;
  }

  /**
  * Adds new data to a leaf
  * @param {Object} claim - Claim data object to be added to the merkle tree
  */
  addClaim(claim){
      // Extract hash index, hash total and calculate position of the claim in the merkle tree
      const hi = utils.hashBytes(claim.data.slice(0, claim.indexLength));
      const ht = utils.hashBytes(claim.data);
      let positionClaim = helpers.hashToPosition(hi,this.numLayers);

      let siblingArray = [];
      let nodeValue;
      let claimTmp;
      let finalIndex;
      let key;
      // Find last node written
      key = this.root; // Start with root node 
      for(let i = 0; i < this.numLayers;i++){
          nodeValue = getNodeValue(this.db,key,this.prefix);
          if(nodeValue == emptyNodeValue){ // Empty node found
              finalIndex = i-1;
              break;
          }
          else if(!nodeValue.flag){ // Check if it is a final node
              let childLeft = nodeValue.data[0];
              let childRight = nodeValue.data[1];
              siblingArray.push(positionClaim[i]?childLeft:childRight);
              key = positionClaim[i]?childRight:childLeft;
          }
          else{ 
              finalIndex = i;
              claimTmp = nodeValue.data; 
              break;
          }
      }

      if(finalIndex < 0) // No siblings where found
      {
          let hashTmp = getCutNodeHash(ht,positionClaim,this.numLayers,this.numLayers);
          this.root = hashTmp;
          let node =  helpers.addFlagNode(claim,true);
          setNodeValue(this.db,hashTmp,node,this.prefix);
          return;
      }
      if(nodeValue == emptyNodeValue){
          // Calcular nuevo nodo, que sera nodo final
          let hashTmp = getCutNodeHash(ht,positionClaim,this.numLayers - (finalIndex+1),this.numLayers);
          let node =  helpers.addFlagNode(claim,true);
          setNodeValue(this.db,hashTmp,node,this.prefix);

          let sibling;
          let nextHash = hashTmp;
          let concat;
          // Calculate rest of nodes through siblings
          for(let i = finalIndex; i >= 0 ;i--){
              if(i < siblingArray.length)
                  sibling = siblingArray[i];
              else
                  sibling = emptyNodeValue;
              concat = positionClaim[i]?[sibling,nextHash]:[nextHash,sibling];
              let nodeNext =  helpers.addFlagNode(concat,false);
              nextHash = utils.hashBytes(Buffer.concat(concat));
              setNodeValue(this.db,nextHash,nodeNext,this.prefix);
          }
          this.root = nextHash;
          return;
      }

      // Compare position claims and find split merkle branch
      let hiTmp = claimTmp.data.slice(0, claimTmp.indexLength);
      let htTmp = utils.hashBytes(claimTmp.data);
      let positionClaimTmp = helpers.hashToPosition(utils.hashBytes(hiTmp),this.numLayers);
      for(let i = finalIndex; i < this.numLayers;i++){
          if(positionClaimTmp[i]^positionClaim[i]){
              finalIndex = i;
              break;
          }
      }
      // Write current branch
      let hashNew = getCutNodeHash(ht,positionClaim,this.numLayers - (finalIndex+1),this.numLayers);
      let hashTmp = getCutNodeHash(htTmp,positionClaimTmp,this.numLayers - (finalIndex+1),this.numLayers);
      let node =  helpers.addFlagNode(claim,true);
      setNodeValue(this.db,hashNew,node,this.prefix);
      node =  helpers.addFlagNode(claimTmp,true);
      setNodeValue(this.db,hashTmp,node,this.prefix);

      // Write next node
      let concat = positionClaim[finalIndex]?[hashTmp,hashNew]:[hashNew,hashTmp];
      let firstNode = helpers.addFlagNode(concat,false);
      let firstHash = utils.hashBytes(Buffer.concat(concat));
      setNodeValue(this.db,firstHash,firstNode,this.prefix);

      let sibling;
      let nextHash = firstHash;
      // Calculate nodes until root through empty nodes or siblings
      for(let i = finalIndex-1; i >= 0 ;i--){
          if(i < siblingArray.length)
              sibling = siblingArray[i];
          else
              sibling = emptyNodeValue;
          concat = positionClaim[i]?[sibling,nextHash]:[nextHash,sibling];
          let nodeNext =  helpers.addFlagNode(concat,false);
          nextHash = utils.hashBytes(Buffer.concat(concat));
          setNodeValue(this.db,nextHash,nodeNext,this.prefix);
      }
      this.root = nextHash;
  }

  /**
  * Generates the merkle proof of the leaf in the position hi 
  * @param {Uint8Array(32)} hi - Hash of the position of the leaf
  * @returns {Object} - Data containing merkle tree proof of existence or non-existence
  */
  generateProof(hi){
      let positionClaim = helpers.hashToPosition(hi,this.numLayers);
      let siblingArray = [];
      let key = this.root;
      let nodeValue;
      let finalIndex;
      let claimTmp;
      // Find last node written
      // Start with root node
      for(let i = 0; i < this.numLayers;i++){
          nodeValue = getNodeValue(this.db,key,this.prefix);
          if(!nodeValue.flag){ // Check if it is a final node
              let childLeft = nodeValue.data[0];
              let childRight = nodeValue.data[1];
              siblingArray.push(positionClaim[i]?childLeft:childRight);
              key = positionClaim[i]?childRight:childLeft;
          }
          else{ 
              finalIndex = i;
              claimTmp = nodeValue.data;
              break;
          }
      }

      let hiTmp = claimTmp.data.slice(0, claimTmp.indexLength);
      let htTmp = utils.hashBytes(claimTmp.data);
      let positionClaimTmp = helpers.hashToPosition(utils.hashBytes(hiTmp),this.numLayers);
      let indexSibling = -1;
      // Compare position claims and find split merkle branch
      // for non-existence proof
      for(let i = finalIndex; i < this.numLayers;i++){
          if(positionClaimTmp[i]^positionClaim[i]){
              indexSibling = i;
              break;
          }
      }

      // Calculate sibling of the last node
      let siblingsIndicator = Buffer.alloc(32);
      let startIndex = siblingsIndicator.length - 1;
      let newSibling = getCutNodeHash(htTmp,positionClaimTmp,this.numLayers - (indexSibling+1),this.numLayers);
      let numByte = Math.floor((indexSibling)/8);
      if(indexSibling > 0 ){
          siblingArray.push(newSibling);
          siblingsIndicator[startIndex - numByte] = helpers.setBit(siblingsIndicator[startIndex - numByte],indexSibling%8);
      }
      if(indexSibling == -1)
          indexSibling = 0;
      
      // Build data object containing: siblings indicator || n*siblings
      for(let i = finalIndex; i > 0 ; i--){
          numByte = Math.floor((i)/8);
          siblingsIndicator[startIndex - numByte] = helpers.setBit(siblingsIndicator[startIndex - numByte],(i-1)%8);
      }
      let returnArray = siblingsIndicator;
      for(let i = 0;i < siblingArray.length;i++){
          let test = siblingArray[siblingArray.length - 1 - i]
          let concat = [returnArray,test];
          returnArray = Buffer.concat(concat);
      }
      return returnArray;
  }

  /**
  * Retrieve data for a given leaf position
  * @param {Uint8Array(32)} hi - Hash of the position of the leaf
  * @returns {Object} - Data of the leaf
  */
  getClaimByHi(hi){
      let positionClaim = helpers.hashToPosition(hi,this.numLayers);
      let key = this.root;
      let nodeValue;
      // Find last node written
      for(let i = 0; i < this.numLayers;i++){
          nodeValue = getNodeValue(this.db,key,this.prefix);
          if(!nodeValue.flag){ // Check if it is a final node
              let childLeft = nodeValue.data[0];
              let childRight = nodeValue.data[1];
              key = positionClaim[i]?childRight:childLeft;
          }
          else
              return utils.bytesToHex(nodeValue.data.data);
      }
      return emptyNodeValue;
  }
}

/**
* Retrieve node value from merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {String} prefix - Prefix added to the key
* @returns {Buffer} - Value of the node
*/
function getNodeValue(db,key,prefix){
    let keyHex = utils.bytesToHex(key);
    let valueHex = db.get(prefix + keyHex);
    if(valueHex === null)
        return emptyNodeValue;
    else
        return helpers.bufferToNodeValue(utils.hexToBytes(valueHex));
}

/**
* Set node value to the merkle tree
* @param {Object} db - Data base object representation
* @param {Buffer} key - Key value of the node
* @param {Buffer} value - Value of the node
* @param {String} prefix - Prefix added to the key
*/
function setNodeValue(db,key,value,prefix){
    let keyHex = utils.bytesToHex(key);
    let valueHex = utils.bytesToHex(helpers.nodeValueToBuffer(value));
    db.insert(prefix + keyHex, valueHex);
}

/**
* Calculate node of merkle tree from bottom to a given position just with empty nodes
* @param {Uint8Array} ht - Hash of the leaf
* @param {Array} bitsHi - Array of bits determining leaf position
* @param {uint} index - Number of levels to calculate
* @returns {Buffer} - A new Buffer
*/
function getCutNodeHash(ht,bitsHi,index,numLayers){
  let hashTmp = ht;
  let concatHash;
  for(let i = 0; i < index; i++){
      concatHash = bitsHi[(numLayers-1)-i]?[emptyNodeValue,hashTmp]:[hashTmp,emptyNodeValue];
      hashTmp = utils.hashBytes(Buffer.concat(concatHash));
  }
  return hashTmp;
}

/**
* Verifies the merkle proof
* @param  {String} rootHex - Hexadecimal string of the merkle tree root
* @param  {String} proofHex - Hexadecimal string of the merkle tree proof
* @param  {String} hiHex - Hexadecimal string of the leaf hash index position
* @param  {String} htHex - Hexadecimal string of the leaf hash data
* @param  {Number} numLevels - Number of levels of the merkle tree
* @returns  {Bool} - Result of the merkle tree verification
*/
function checkProof(rootHex, proofHex, hiHex, htHex, numLevels) {
  const r = utils.hexToBytes(rootHex);
  const proof = utils.hexToBytes(proofHex);
  const proofLength = proof.length;
  const hi = utils.hexToBytes(hiHex);
  const ht = utils.hexToBytes(htHex);
  const empties = proof.slice(0, 32);
  const emptiesLength = empties.length;
  const hashLength = emptyNodeValue.length;
  const siblings = [];
  const numLayers = numLevels - 1;
  const path = helpers.hashToPosition(hi,numLayers);
  let nodeHash = ht;
  let siblingUsedPos = 0;
  
  // Get all siblings and store into sibling array
  for (let i = emptiesLength; i < proofLength; i += hashLength) {
      const siblingHash = proof.slice(i, i + hashLength);
      siblings.push(siblingHash);
  }

  // Calculate root of the merkle tree giving the claim
  for(let index = numLayers - 1; index >= 0; index--){
      let numByte = Math.floor(index/8);
      let sibling = [];
      let flagBit = helpers.getBit(empties[emptiesLength - 1 - numByte],index%8)
      if(flagBit){
          sibling = siblings[siblingUsedPos];
          siblingUsedPos += 1;
      }else{
          sibling = emptyNodeValue;
      }
      let nodeTmp;
      let node = {};
      nodeTmp = path[index]?[sibling, nodeHash]:[nodeHash, sibling];
      node = Buffer.concat(nodeTmp);

      
      if ((Buffer.compare(nodeHash, emptyNodeValue) === 0) && (Buffer.compare(sibling, emptyNodeValue) === 0)) {
          nodeHash = emptyNodeValue;
      } else {
          nodeHash = utils.hashBytes(node);
      }
  }
  return Buffer.compare(nodeHash, r) === 0;
};


module.exports = {
  MerkleTree,
  emptyNodeValue,
  checkProof
};
