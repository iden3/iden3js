const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const utils = require('./utils');

/**
 * @param  {Buffer} msg
 * @param  {Buffer} msgHash
 * @param  {Buffer} v
 * @param  {Buffer} r
 * @param  {Buffer} s
 * @returns {Object}
 */
function concatSignature(msg, msgHash, v, r, s) {
  var serialized = Buffer.from("");
  serialized = Buffer.concat([serialized, r]);
  serialized = Buffer.concat([serialized, s]);
  serialized = Buffer.concat([
    serialized,
    Buffer.from([v])
  ]);
  var signedMsg = {
    message: ethUtil.bufferToHex(msg),
    messageHash: ethUtil.bufferToHex(msgHash),
    v: ethUtil.bufferToHex(v),
    r: ethUtil.bufferToHex(r),
    s: ethUtil.bufferToHex(s),
    signature: ethUtil.bufferToHex(serialized)
  };
  return signedMsg;
}

/**
 * @param  {String} privK
 */
class KeyContainer {
  constructor(type) {
    if (type == 'teststorage') {
      return new TestContainer;
    }
    return undefined;
  }
}

class TestContainer {
  constructor() {
    this.keys = {};
    this.type = 'teststorage';
  }

  /**
   * @returns {String} AddressHex
   */
  generateKey() {
    let w = ethWallet.generate();
    let privK = w._privKey;
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);
    this.keys[addressHex] = privK;
    return addressHex;
  }

  /**
   * @returns {String} AddressHex
   */
  importKey(privKHex) {
    let privK = utils.hexToBytes(privKHex);
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);
    this.keys[addressHex] = privK;
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {String} data
   * @returns {String} signature
   */
  sign(addressHex, data) {
    let privK = this.keys[addressHex];
    var message = ethUtil.toBuffer(data);
    var msgHash = ethUtil.hashPersonalMessage(message);
    var sig = ethUtil.ecsign(msgHash, Buffer.from(privK, 'hex'));
    return concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  /**
   * @returns {Array}
   */
  listKeys() {
    let keysList = [];
    for (var key in this.keys) {
      if (this.keys.hasOwnProperty(key)) {
        keysList.push(key);
      }
    }
    return keysList;
  }

  /**
   * @param  {String} addressHex
   */
  deleteKey(addressHex) {
    delete this.keys[addressHex];
  }
}

module.exports = KeyContainer;
