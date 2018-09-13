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
  serialized = Buffer.concat([serialized, Buffer.from([v])]);
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
module.exports = class KeyContainer {
  constructor(privK) {
    if (privK != undefined) {
      // import privK
      this.privateKey = utils.hexToBytes(privK);
    } else {
      // generate new id
      let w = ethWallet.generate()
      this.privateKey = w._privKey;
    }
  }
  sign(data) {
    var message = ethUtil.toBuffer(data);
    var msgHash = ethUtil.hashPersonalMessage(message);
    var sig = ethUtil.ecsign(msgHash, Buffer.from(this.privateKey, 'hex'));
    return concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }
  address() {
    return ethUtil.privateToAddress(this.privateKey);
  }
  addressHex() {
    return utils.bytesToHex(this.address());
  }
}
