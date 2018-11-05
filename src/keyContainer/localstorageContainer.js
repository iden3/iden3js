const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
var bip39 = require('bip39');
var hdkey = require('hdkey');

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
   * @param  {String} mnemonic
   * @returns {Object}
   */
  generateKeysMnemonic(mnemonic) {
    if (this.encryptionKey === '') {
      // KeyContainer not unlocked
      return undefined;
    }
    if (mnemonic == undefined) {
      mnemonic = bip39.generateMnemonic(); // by default 128, 256
    }
    const root = hdkey.fromMasterSeed(mnemonic);
    const masterPrivateKey = root.privateKey;
    const masterPubKey = root.publicKey;

    var keys = [];
    var path = "m/44'/60'/0'/0/";
    for (var i = 0; i < 3; i++) { // to allow in the future specify how many keys want to derivate
      const addrNode = root.derive(path + i); // "m/44'/60'/0'/0/i"
      let privK = addrNode._privateKey;
      const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
      let address = ethUtil.privateToAddress(addrNode._privateKey);
      let addressHex = utils.bytesToHex(address);
      keys.push(addressHex);
      let privKHex = utils.bytesToHex(privK);
      let privKHexEncrypted = kcutils.encrypt(this.encryptionKey, privKHex);
      localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    }

    return {keys: keys, mnemonic: mnemonic};
  }

  /**
   * @returns {String} AddressHex
   */
  generateKeyRand() {
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
   * @param {String} - PrivK
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
