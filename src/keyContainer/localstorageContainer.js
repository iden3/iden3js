const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const nacl = require('tweetnacl');
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
    setTimeout(function () {
      this.encryptionKey = '';
      // console.log('KC locked');
    }, 30000);
  }

  /**
   * @returns {String} AddressHex
   */
  generateKey() {
    if (!this.encryptionKey) {
      // KeyContainer not unlocked
      return undefined;
    }

    const w = ethWallet.generate();
    const privK = w._privKey;
    const privKHex = utils.bytesToHex(privK);
    const privKHexEncrypted = kcutils.encrypt(this.encryptionKey, privKHex);
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);

    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @returns {String} AddressHex
   */
  importKey(privKHex) {
    if (!this.encryptionKey) {
      // KeyContainer not unlocked
      return undefined;
    }
    const privK = utils.hexToBytes(privKHex);
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);
    const privKHexEncrypted = kcutils.encrypt(this.encryptionKey, privKHex);

    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {String} data
   * @returns {Object} signatureObj
   */
  sign(addressHex, data) {
    if (!this.encryptionKey) {
      // KeyContainer not unlocked
      return 'KeyContainer blocked';
    }
    const privKHexEncrypted = localStorage.getItem(this.prefix + addressHex);
    const message = ethUtil.toBuffer(data);
    const msgHash = ethUtil.hashPersonalMessage(message);
    const privKHex = kcutils.decrypt(this.encryptionKey, privKHexEncrypted);
    const sig = ethUtil.ecsign(msgHash, utils.hexToBytes(privKHex));

    return kcutils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  /**
   * @returns {Array}
   */
  listKeys() {
    const keysList = [];
    const localStorageLength = localStorage.length;

    for (let i = 0, len = localStorageLength; i < len; i++) {
      // get only the stored data related to keycontainer (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        const key = localStorage.key(i).replace(this.prefix, '');
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
