// @flow

// const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const CONSTANTS = require('../constants');
const utils = require('../utils');
const kcUtils = require('./kc-utils');
const eddsa = require('../crypto/eddsa-babyjub');

const { errorLockedMsg, errorDbKeyNoExistMsg, mimc7HashBuffer } = kcUtils;

nacl.util = require('tweetnacl-util');

/**
 * KeyContainer generates and stores keys, and allows using them to sign messages.
 * Usage of keys requires the KeyContainer to be unlocked.  Most functions
 * throw new Error(errorLockedMsg) if the KeyContainer is not unlocked.
 */
class KeyContainer {
  prefix: string;
  encryptionKey: string;
  db: any;
  timer: any;

  constructor(db: any) {
    this.prefix = CONSTANTS.KCPREFIX;
    this.encryptionKey = '';
    this.db = db;
    this.timer = {};
  }

  /*
   * Unlock key container by the passphrase to use keys
   * @param  {String} passphrase
   */
  unlock(passphrase: string) {
    // unlock key container
    this.encryptionKey = kcUtils.passToKey(passphrase, 'salt');
    clearTimeout(this.timer);
    const self = this;
    this.timer = setTimeout(() => {
      // key container locked again
      self.encryptionKey = '';
    }, 30000);
  }

  /**
   * Lock local storage container
   */
  lock() {
    if (!this.encryptionKey) { return; }
    clearTimeout(this.timer);
    // key container locked
    this.encryptionKey = '';
  }

  /**
   * Check if local storage container is unlocked
   * @returns {Bool} - Lock / Unlock
   */
  isUnlock(): boolean {
    if (this.encryptionKey) {
      return true;
    }
    return false;
  }

  // NOT USED
  // /**
  //  * Save a given key - value pair
  //  * @param {String} - Key
  //  * @param {Object} - Value
  //  * @returns {Bool} - True if databe has been written correctly, False otherwise
  //  */
  // saveObject(key: string, value: any) {
  //   this.db.insert(this.prefix + key, JSON.stringify(value));
  // }

  /**
   * Generates master mnemonic
   * @param {String} - Mnemonic to store
   */
  setMasterSeed(mnemonic: string = bip39.generateMnemonic()) {
    if (!bip39.validateMnemonic(mnemonic)) { throw new Error('Mnemonic validation failed'); }
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const seedEncrypted = this._encrypt(mnemonic);
    this.db.insert(`${this.prefix}/masterSeed`, seedEncrypted);
  }

  /**
   * Get the value of a key in the key container database
   * @param {string} key - database key
   * @returns {string} database value
   */
  _getKey(key: string): string {
    const value = this.db.get(`${this.prefix}/${key}`);
    if (value == null) {
      throw new Error(errorDbKeyNoExistMsg);
    }
    return value;
  }

  /**
   * Get and decrypt the value of a key in the key container database
   * @param {string} key - database key
   * @returns {string} decrypted key
   */
  _getKeyDecrypt(key: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    return this._decrypt(this._getKey(key));
  }

  /**
   * Store and encrypt a value with a key in the key container database
   * @param {string} key - database key
   * @param {string} value - string to encrypt by key parameter
   */
  _setKeyValueEncrypt(key: string, value: string) {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const valueEncrypted = this._encrypt(value);
    this.db.insert(`${this.prefix}/${key}`, valueEncrypted);
  }

  /**
   * Get master seed
   * @returns {String} Mnemonic representing the master seed
   */
  getMasterSeed(): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    return this._getKeyDecrypt('masterSeed');
  }

  /**
   * Generates identity seed and store it into the database along with its current path
   * @param {String} seed - Master seed
   */
  generateKeySeed(masterSeed: string) {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathRoot = "m/44'/60'/0'";
    // Identity master generation
    const nodeId = root.derive(pathRoot);
    const privKey = nodeId._privateKey;
    const keySeed = bip39.entropyToMnemonic(privKey);
    const keySeedEncrypted = this._encrypt(keySeed);
    const pathKey = Buffer.alloc(4);
    pathKey.writeUInt32BE(0, 0);
    const pathKeySeedEncrypted = this._encrypt(utils.bytesToHex(pathKey));

    this.db.insert(`${this.prefix}/keySeed`, JSON.stringify({ keySeedEncrypted, pathKeySeedEncrypted }));
  }

  /**
   * Gets identity seed and its current path
   * @return {Object} - Contains identity seed and current path
   */
  getKeySeed(): {keySeed: string, pathKey: number} {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const keySeedDb = this._getKey('keySeed');
    const { keySeedEncrypted, pathKeySeedEncrypted } = JSON.parse(keySeedDb);
    const keySeed = this._decrypt(keySeedEncrypted);
    const pathKeySeed = this._decrypt(pathKeySeedEncrypted);
    const pathKey = (utils.hexToBytes(pathKeySeed)).readUInt32BE(0);

    return { keySeed, pathKey };
  }

  /**
   * Gets identity seed path and increase it by one
   */
  _increaseKeyPath() {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const { keySeed, pathKey } = this.getKeySeed();
    const increasePathKey = pathKey + 1;
    const pathKeyDb = Buffer.alloc(4);
    pathKeyDb.writeUInt32BE(increasePathKey, 0);
    const keySeedEncrypted = this._encrypt(keySeed);
    const pathKeySeedEncrypted = this._encrypt(utils.bytesToHex(pathKeyDb));

    this.db.insert(`${this.prefix}/keySeed`, JSON.stringify({ keySeedEncrypted, pathKeySeedEncrypted }));
  }

  /**
   * Generates recovery seed and store it into the database
   * @param {String} masterSeed - Master seed
   * @return {String} - Public recovery address
   */
  generateRecoveryAddr(masterSeed: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathRecovery = "m/44'/60'/1'";
    const addrNodeRecovery = root.derive(pathRecovery);
    const privRecovery = addrNodeRecovery._privateKey;
    const addressRecovery = ethUtil.privateToAddress(privRecovery);
    const addressRecoveryHex = utils.bytesToHex(addressRecovery);
    const privRecoveryHex = utils.bytesToHex(privRecovery);
    const privRecoveryHexEncrypted = this._encrypt(privRecoveryHex);

    this.db.insert(`${this.prefix}/${CONSTANTS.IDRECOVERYPREFIX}/${addressRecoveryHex}`, privRecoveryHexEncrypted);
    return addressRecoveryHex;
  }

  /**
   * Generates backup key and store it into the database
   * @param {String} masterSeed - Master seed
   * @return {String} - Public key to encrypt
   */
  generateKeyBackUp(masterSeed: string): string {
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathBackup = "m/44'/60'/2'";
    const addrNodeBackup = root.derive(pathBackup);
    const privKeyBackup = addrNodeBackup._privateKey;
    // genarate public key from private key
    const keyPair = nacl.box.keyPair.fromSecretKey(privKeyBackup);
    const pubKeyBackup = keyPair.publicKey;
    const pubKeyBackup64 = utils.bytesToBase64(Buffer.from(pubKeyBackup));

    this.db.insert(`${this.prefix}/${CONSTANTS.PUBKEYBACKUP}`, pubKeyBackup64);
    return pubKeyBackup64;
  }

  /**
   * Get backup public key
   * @return {String} - Backup public key
   */
  getBackupPubKey(): string {
    return this._getKey(CONSTANTS.PUBKEYBACKUP);
  }

  /**
   * Get backup private key from a given seed
   * @param {String} masterSeed - Master seed
   * @return {Object} - Key pair (public - private) derived from master seed represented both in base64 string
   */
  getPrivKeyBackUpFromSeed(masterSeed: string): {privateKey: string, publicKey: string} {
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathRecovery = "m/44'/60'/2'";
    const addrNodeRecovery = root.derive(pathRecovery);
    const privKeyBackup = addrNodeRecovery._privateKey;
    const privKeyBackup64 = utils.bytesToBase64(privKeyBackup);
    const keyPair = nacl.box.keyPair.fromSecretKey(privKeyBackup);
    const pubKeyBackup = keyPair.publicKey;
    const pubKeyBackup64 = utils.bytesToBase64(Buffer.from(pubKeyBackup));

    return { privateKey: privKeyBackup64, publicKey: pubKeyBackup64 };
  }

  /**
   * Generates a random key from a given key seed and its path
   * @param {UInt32} keyProfilePath - First path to derive the key
   * @param {UInt32} keyPath - Second path to derive the key
   * @param {Bool} isPublic - Indicates if public key or public adress is created
   * @returns {String} New key generated
   */
  generateSingleKey(keyProfilePath: number, keyPath: number, isPublic: boolean): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const path = `m/44'/60'/0'/${keyProfilePath}/${keyPath}`;
    const { keySeed } = this.getKeySeed();
    const root = hdkey.fromMasterSeed(keySeed);
    const addrNode = root.derive(path);
    const privK = addrNode._privateKey;
    const address = isPublic ? addrNode._publicKey : ethUtil.privateToAddress(addrNode._privateKey);
    const addressHex = utils.bytesToHex(address);
    const privKHex = utils.bytesToHex(privK);
    const privKHexEncrypted = this._encrypt(privKHex);

    this.db.insert(`${this.prefix}/${addressHex}`, privKHexEncrypted);
    return addressHex;
  }

  /**
   * Gets recovery address from the data base
   * @return {String} - Recovery public address
   */
  getRecoveryAddr(): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const keyDb = this._listKeys(CONSTANTS.IDRECOVERYPREFIX);

    if (keyDb.length === 0) {
      throw new Error('Recovery address not found in the DB');
    }
    return keyDb[0].replace(`${this.prefix}/${CONSTANTS.IDRECOVERYPREFIX}/`, '');
  }

  /**
   * Generate keys from a given path profile to create afterwards an identity
   * @param  {String} mnemonic - String with 12 words
   * @param {Number} pathProfile - Indicates the penultimate layer of the derivation path, for the different identity profiles
   * @returns {Object} It contains all the keys generated
   */
  _generateKeysFromKeyPath(mnemonic: string = bip39.generateMnemonic(),
    pathProfile: number = 0): { kOp: string, kRev: string, kRec: string } {
    if (!bip39.validateMnemonic(mnemonic)) { throw new Error('Mnemonic validation failed'); }
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const root = hdkey.fromMasterSeed(mnemonic);
    const path = `m/44'/60'/0'/${pathProfile}`;
    let i = 0;

    // kOperational BabyJub
    i = 0;
    let addrNode = root.derive(`${path}/${i}`); // "m/44'/60'/0'/pathProfile/i"
    const kOp = this.importBabyKey(addrNode._privateKey.toString('hex'));

    // kRevoke, kRecovery Ethereum
    const ethKeys = [];
    for (i = 1; i < 3; i++) {
      addrNode = root.derive(`${path}/${i}`); // "m/44'/60'/0'/pathProfile/i"
      const { publicKey } = this.importKey(addrNode._privateKey.toString('hex'));
      ethKeys.push(`0x${publicKey}`);
    }

    return { kOp, kRev: ethKeys[0], kRec: ethKeys[1] };
  }

  /**
   * Creates all the keys needed to create an identity afterwards
   * @returns {Object} - It contains all the keys generated, undefined otherwise
   */
  createKeys(): { kOp: string, kRev: string, kRec: string } {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    let objectKeySeed;
    // Get key seed and generate if it is not already created
    try {
      objectKeySeed = this.getKeySeed();
    } catch (error) {
      // Generate key seed if it doesn't exist
      if (error.message === errorDbKeyNoExistMsg) {
        this.generateKeySeed(this.getMasterSeed());
        objectKeySeed = this.getKeySeed();
      } else {
        throw error;
      }
    }
    // Creates keys
    const keys = this._generateKeysFromKeyPath(objectKeySeed.keySeed, objectKeySeed.pathKey);
    // this.increaseKeyPath();
    return keys;
  }

  // NOT USED
  // /**
  //  * Get all the identities from dataBase
  //  * @returns {Array} Contains all the identities found in the database
  //  */
  // listIdentities(): Array<string> {
  //   return this._listKeys(CONSTANTS.IDPREFIX);
  // }

  // NOT USED
  // /**
  //   * @returns {String} AddressHex
  //   */
  // generateKeyRand(): { publicKey: string, address: string } {
  //   if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
  //   const w = ethWallet.generate();
  //   return this.importKey(w._privKey.toString('hex'));
  // }

  /**
   * Derives secp256k1 public key and addres from private key and store them
   * @param {String} privateKeyHex - private key in hexadecimal representation
   * @returns {Object} secp256k1 public key and address generate from private key, encoding in hex
   */
  importKey(privateKeyHex: string): { publicKey: string, address: string } {
    const privateKey = utils.hexToBytes(privateKeyHex);
    const addressHex = ethUtil.privateToAddress(privateKey).toString('hex');
    const publicKeyHex = ethUtil.privateToPublic(privateKey).toString('hex');

    this._setKeyValueEncrypt(`eth-addr/${addressHex}`, privateKeyHex);
    this._setKeyValueEncrypt(`eth-pk/${publicKeyHex}`, privateKeyHex);
    return { publicKey: publicKeyHex, address: addressHex };
  }

  /**
   * Derives baby jub public key and stores it
   * @param {String} privateKeyHex - private key in hexadecimal representation
   * @returns {String} baby jub public key from private key, encoding in hex
   */
  importBabyKey(privateKeyHex: string): string {
    const privateKeyBuffer = utils.hexToBytes(privateKeyHex);
    const privateKey = new eddsa.PrivateKey(privateKeyBuffer);
    const publicKeyHex = privateKey.public().toString();
    this._setKeyValueEncrypt(`bj/${publicKeyHex}`, privateKey.toString());
    return publicKeyHex;
  }

  /**
   * Sign message with secp256k1 key
   * @param {String} addressHex - public address
   * @param {Buffer} message - message to sign
   * @returns {Object} Signature object
   */
  sign(addressHex: string, message: Buffer): Object {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    // const privKHexEncrypted = localStorage.getItem(this.prefix + addressHex);
    const privKHex = this._getKeyDecrypt(`eth-addr/${addressHex}`);
    const msgHash = ethUtil.hashPersonalMessage(message);
    const sig = ethUtil.ecsign(msgHash, utils.hexToBytes(privKHex));

    return kcUtils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  /**
   * Sign message with babyjub key
   * @param {String} addressHex - public key
   * @param {Buffer} message - message to sign
   * @returns {Signature} Eddsa signature object
   */
  signBaby(publicKeyHex: string, message: Buffer): eddsa.Signature {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    const privateKeyHex = this._getKeyDecrypt(`bj/${publicKeyHex}`);
    const privateKey = new eddsa.PrivateKey(Buffer.from(privateKeyHex, 'hex'));
    return privateKey.signMimc7(mimc7HashBuffer(message));
  }

  /**
   * Retrieve all keys that matches a given string
   * @param {String} key - key to search into key container
   * @returns {Array} - List all the keys that matches the input key parameter
   */
  _listKeys(key: string): Array<string> {
    return this.db.listKeys(`${this.prefix}/${key}`);
  }

  /**
   * Deletes a key that matches the input parameter
   * @param {String} key - key to delete
   */
  deleteKey(key: string) {
    // localStorage.removeItem(this.prefix + addressHex);
    this.db.delete(`${this.prefix}/${key}`);
  }

  // DANGER: this funciton deletes the entire db!
  /**
   * Deletes the whole database
   */
  deleteAll() {
    // localStorage.clear();
    this.db.deleteAll();
  }

  /**
   * Encrypt a string using the key container encryptionKey
   * @param {string} m - message to encrypt
   * @returns {string}
   */
  _encrypt(m: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    return kcUtils.encrypt(this.encryptionKey, m);
  }

  /**
   * Decrypt a string using the key container encryptionKey
   * @param {string} c - message to decrypt
   * @returns {string}
   */
  _decrypt(c: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg); }
    return kcUtils.decrypt(this.encryptionKey, c);
  }
}

module.exports = KeyContainer;
