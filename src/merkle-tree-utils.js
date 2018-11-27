/**
* Add flag to leaf data object
* @param {Object} data - Data representation of a leaf
* @param {bool} flag - Data added to a leaf object
* @returns {Buffer} - New data representation of a leaf
*/
function addFlagNode(data,flag){
    let nodeValue = {
        flag:flag,
        data:data
    };
    return nodeValue;
}

/**
* Sets bit to 1 into a Uint8
* @param {Uint8} byte - Byte to change
* @returns {Uint8} pos - Position of the bit to set
*/
function setBit(byte,pos){
    let mask = 1;
    while(pos){
        mask<<=1
        pos--;
    }
    return byte|mask;
}

/**
* Gets a concrete bit of a Uint8
* @param {Uint8} byte - Byte to get the bit
* @returns {Uint8} pos - Position of the bit to get
*/
function getBit(byte,pos){
    let mask = 1;
    while(pos){
        mask<<=1
        pos--;
    }
    return byte&mask;
}

/**
* Gets binary represantion of leaf position
* @param {Uint8Array} array - Hash index of the leaf
* @returns {Array} - Array of bits determining leaf position
* @length {Uint8} - Lenght of the array returned
*/
function hashToPosition(array,length){
    let numBytes = Math.ceil((length - 1)/8);
    let positionClaim = [];
    for(let i = 0; i < numBytes;i++){
        let tmp = array[(array.length-1) - i];
        for(let j = 0; j<8;j++)
            positionClaim[j+8*i] = (tmp >> j) & 0x01;        
    }
    return positionClaim.slice(0,length);
}

/**
* Create a buffer from a node object
* @param {Object} nodeValue - Object representation of node value data
* @returns {Buffer} - New buffer 
*/
function nodeValueToBuffer(nodeValue){
    let buffFlag = Buffer.alloc(1);
    buffFlag.writeUInt8(nodeValue.flag);
    if(buffFlag[0]){
        let buffIndex = Buffer.alloc(4);
        buffIndex.writeUInt32LE(nodeValue.data.indexLength);
        return Buffer.concat([buffFlag,buffIndex,nodeValue.data.data]);
    }else
        return Buffer.concat([buffFlag,nodeValue.data[0],nodeValue.data[1]]);
}

/**
* Decode a buffer into an object represenation of node value
* @param {Buffer} nodeValueBuffer - Buffer to decode
* @returns {Object} - New object containing node value data
*/
function bufferToNodeValue(nodeValueBuffer){
    let flag = nodeValueBuffer.readUInt8();
    let nodeValue;
    if(flag){
        nodeValue = {
            flag:nodeValueBuffer.readUInt8(),
            data:   {
                        data:nodeValueBuffer.slice(5,nodeValueBuffer.length),
                        indexLength: nodeValueBuffer.readUInt32LE(1)
                    }
        };
    }
    else{
        nodeValue = {
            flag:nodeValueBuffer.readUInt8(),
            data:[nodeValueBuffer.slice(1,33),nodeValueBuffer.slice(33,nodeValueBuffer.length)],      
        };
    }
    return  nodeValue;
}

module.exports = {
    addFlagNode,
    setBit,
    getBit,
    hashToPosition,
    nodeValueToBuffer,
    bufferToNodeValue
};