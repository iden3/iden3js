const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const utils = require('../utils');
const kcutils = require('./kcutils');



class TeststorageContainer {
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
    return kcutils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
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

module.exports = TeststorageContainer;
