const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const utils = require('../utils');
const kcutils = require('./kcutils');

// load node-localstorage if we are in a node environment,
// if not, we are in a browser and already we have the local storage
if (utils.isNodeEnv()){
  if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
}

class LocalstorageContainer {
  constructor() { // idaddr used as prefix
    this.keys = {};
    this.prefix = 'i3-';
    this.type = 'localstorage';
  }

  /**
   * @returns {String} AddressHex
   */
  generateKey() {
    let w = ethWallet.generate();
    let privK = w._privKey;
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);
    localStorage.setItem(this.prefix + addressHex, privK);
    return addressHex;
  }

  /**
   * @returns {String} AddressHex
   */
  importKey(privKHex) {
    let privK = utils.hexToBytes(privKHex);
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);
    localStorage.setItem(this.prefix + addressHex, privKHex);
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {String} data
   * @returns {String} signature
   */
  sign(addressHex, data) {
    let privKHex = localStorage.getItem(this.prefix + addressHex);
    var message = ethUtil.toBuffer(data);
    var msgHash = ethUtil.hashPersonalMessage(message);
    var sig = ethUtil.ecsign(msgHash, Buffer.from(privKHex, 'hex'));
    return kcutils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  /**
   * @returns {Array}
   */
  listKeys() {
    let keysList = [];
    for (var i = 0, len = localStorage.length; i < len; i++) {
      var key = localStorage.key(i).replace(this.prefix, '');
      keysList.push(key);
    }
    return keysList;
  }

  /**
   * @param  {String} addressHex
   */
  deleteKey(addressHex) {
    localStorage.removeItem(this.prefix + addressHex);
  }
  deleteAll(){
    localStorage.clear();
  }
}

module.exports = LocalstorageContainer;
