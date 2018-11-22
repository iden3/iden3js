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

module.exports = {
    addFlagNode,
    setBit,
    getBit,
    hashToPosition
};