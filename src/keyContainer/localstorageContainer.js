const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const utils = require('../utils');
const kcutils = require('./kcutils');

// if (typeof localStorage === "undefined" || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./tmp');
// }

class LocalstorageContainer {
  constructor() { // idaddr used as prefix
    this.prefix = 'i3-';
    this.type = 'localstorage';
    this.encryptionKey = '';
  }

  /**
   * @param  {String} passphrase
   */
  unlock(passphrase) {
    this.encryptionKey = kcutils.passToKey(passphrase, 'salt');
    setTimeout(function() {
      this.encryptionKey = '';
      // console.log('KC locked');
    }, 30000);
  }

  /**
   * @returns {String} AddressHex
   */
  generateKey() {
    if (this.encryptionKey === '') {
      // KeyContainer not unlocked
      return undefined;
    }
    let w = ethWallet.generate();
    let privK = w._privKey;
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);
    let privKHex = utils.bytesToHex(privK);

    let privKHexEncrypted = kcutils.encrypt(this.encryptionKey, privKHex);
    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @returns {String} AddressHex
   */
  importKey(privKHex) {
    if (this.encryptionKey === '') {
      // KeyContainer not unlocked
      return undefined;
    }
    let privK = utils.hexToBytes(privKHex);
    let address = ethUtil.privateToAddress(privK);
    let addressHex = utils.bytesToHex(address);

    let privKHexEncrypted = kcutils.encrypt(this.encryptionKey, privKHex);
    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {String} data
   * @returns {Object} signatureObj
   */
  sign(addressHex, data) {
    if (this.encryptionKey === '') {
      // KeyContainer not unlocked
      return "KeyContainer blocked";
    }
    let privKHexEncrypted = localStorage.getItem(this.prefix + addressHex);
    var message = ethUtil.toBuffer(data);
    var msgHash = ethUtil.hashPersonalMessage(message);

    let privKHex = kcutils.decrypt(this.encryptionKey, privKHexEncrypted);
    var sig = ethUtil.ecsign(msgHash, utils.hexToBytes(privKHex));
    return kcutils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  /**
   * @returns {Array}
   */
  listKeys() {
    let keysList = [];
    for (var i = 0, len = localStorage.length; i < len; i++) {
      // get only the stored data related to keycontainer (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        var key = localStorage.key(i).replace(this.prefix, '');
        keysList.push(key);
      }
    }
    return keysList;
  }

  /**
   * @param  {String} addressHex
   */
  deleteKey(addressHex) {
    localStorage.removeItem(this.prefix + addressHex);
  }
  deleteAll() {
    localStorage.clear();
  }
}

module.exports = LocalstorageContainer;
