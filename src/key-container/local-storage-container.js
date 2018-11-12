const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const CONSTANTS = require('../constants');
const utils = require('../utils');
const kcUtils = require('./kc-utils');

// prefix for the localStorage stored items
const prefix = 'i3-';

nacl.util = require('tweetnacl-util');

// if (typeof localStorage === 'undefined' || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./tmp');
// }

class LocalStorageContainer {
  constructor() { // idaddr used as prefix
    this.prefix = CONSTANTS.PREFIX;
    this.type = 'localStorage';
    this.encryptionKey = '';
  }

  /**
   * @param  {String} passphrase
   */
  unlock(passphrase) {
    this.encryptionKey = kcUtils.passToKey(passphrase, 'salt');
    setTimeout(function() {
      this.encryptionKey = '';
      // console.log('KC locked');
    }, 30000);
  }

  /**
   * @param  {String} mnemonic - String with 12 words
   * @param  {Number} numberOfDerivatedKeys
   *
   * @returns {Object}
   */
  generateKeysMnemonic(mnemonic = bip39.generateMnemonic(), numberOfDerivatedKeys = 3) {
    if (!this.encryptionKey || mnemonic.constructor !== String) {
      // KeyContainer not unlocked
      return undefined;
    }
    const root = hdkey.fromMasterSeed(mnemonic);
    const keys = [];
    const path = "m/44'/60'/0'/0/";

    // to allow in the future specify how many keys want to derivate
    for (let i = 0; i < numberOfDerivatedKeys; i++) {
      const addrNode = root.derive(path + i); // "m/44'/60'/0'/0/i"
      const privK = addrNode._privateKey;
      const address = ethUtil.privateToAddress(addrNode._privateKey);
      const addressHex = utils.bytesToHex(address);
      const privKHex = utils.bytesToHex(privK);
      const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);

      keys.push(addressHex);
      localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    }

    return {keys, mnemonic};
  }

  /**
   * @returns {String} AddressHex
   */
  generateKeyRand() {
    if (!this.encryptionKey) {
      // KeyContainer not unlocked
      return undefined;
    }
    const w = ethWallet.generate();
    const privK = w._privKey;
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);
    const privKHex = utils.bytesToHex(privK);

    const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);
    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param {String} privKHex - PrivK
   *
   * @returns {String} AddressHex
   */
  importKey(privKHex) {
    if (!this.encryptionKey || privKHex.constructor !== String) {
      // KeyContainer not unlocked
      return undefined;
    }
    const privK = utils.hexToBytes(privKHex);
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);
    const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);

    localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {String} data
   *
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
    const privKHex = kcUtils.decrypt(this.encryptionKey, privKHexEncrypted);
    const sig = ethUtil.ecsign(msgHash, utils.hexToBytes(privKHex));

    return kcUtils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
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

module.exports = LocalStorageContainer;
