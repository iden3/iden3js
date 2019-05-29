// @flow

const ethWallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const CONSTANTS = require('../constants');
const utils = require('../utils');
const kcUtils = require('./kc-utils');
const eddsa = require('../crypto/eddsa-babyjub');

const errorLockedMsg = kcUtils.errorLockedMsg;
const errorKeySeedNoExistMsg = kcUtils.errorKeySeedNoExistMsg;
const mimc7HashBuffer = kcUtils.mimc7HashBuffer;

nacl.util = require('tweetnacl-util');


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
    if (!this.encryptionKey) {
      // console.error('Error: KeyContainer not unlocked');
      return;
    }
    const self = this;
    clearTimeout(this.timer);
    // key container locked
    self.encryptionKey = '';
  }

  /**
   * Check if local storage container is unlocked
   * @returns {Bool} - Lock / unlock
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
   * @returns {Bool} - True if database has been written correctly, False otherwise
   */
  generateMasterSeed(mnemonic: string = bip39.generateMnemonic()): boolean {
    if (this.isUnlock() && bip39.validateMnemonic(mnemonic)) {
      this.saveMasterSeed(mnemonic);
      return true;
    }
    return false;
  }

  /**
   * Save master seed into database
   * @param {String} - Mnemonic to store
   * @returns {Bool} - True if databe has been written correctly, False otherwise
   */
  saveMasterSeed(masterSeed: string) {
    const seedEncrypted = kcUtils.encrypt(this.encryptionKey, masterSeed);

    this.db.insert(`${this.prefix}masterSeed`, seedEncrypted);
  }

  /**
   * Get master seed
   * @param {String} pass - Passphrase enter by the user
   * @returns {String} Mnemonic representing the master seed
   */
  getMasterSeed(): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const seedKey = this.db.listKeys(`${this.prefix}masterSeed`);
    let mnemonic = '';
    if (seedKey.length === 0) {
      throw new Error(errorKeySeedNoExistMsg);
    }
    const seedEncrypted = this.db.get(seedKey);
    mnemonic = kcUtils.decrypt(this.encryptionKey, seedEncrypted);
    return mnemonic;
  }

  /**
   * Creates all the keys needed to create an identity afterwards
   * @returns {Object} - It contains all the keys generated, undefined otherwise
   */
  createKeys(): Array<eddsa.PublicKey> {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    let objectKeySeed;
    // Get key seed and generate if it is not already created
    try {
      objectKeySeed = this.getKeySeed();
    } catch (error) {
      // Generate key seed if it doesn't exist
      if (error.message === errorKeySeedNoExistMsg) {
        this.generateKeySeed(this.getMasterSeed());
        objectKeySeed = this.getKeySeed();
      } else {
        throw error;
      }
    }
    // Creates keys
    const keys = this.generateKeysFromKeyPath(objectKeySeed.keySeed, objectKeySeed.pathKey);
    this.increaseKeyPath();
    return keys;
  }

  /**
   * Generates identity seed and store it into the database along with its current path
   * @param {String} seed - Master seed
   * @return {Bool} - True if function succeeds otherwise false
   */
  generateKeySeed(masterSeed: string) {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathRoot = "m/44'/60'/0'";
    // Identity master generation
    const nodeId = root.derive(pathRoot);
    const privKey = nodeId._privateKey;
    const keySeed = bip39.entropyToMnemonic(privKey);
    const keySeedEncrypted = kcUtils.encrypt(this.encryptionKey, keySeed);
    const pathKey = Buffer.alloc(4);
    pathKey.writeUInt32BE(0, 0);
    const pathKeySeedEncrypted = kcUtils.encrypt(this.encryptionKey, utils.bytesToHex(pathKey));

    this.db.insert(`${this.prefix}keySeed`, JSON.stringify({ keySeedEncrypted, pathKeySeedEncrypted }));
  }

  /**
   * Gets identity seed and its current path
   * @return {Object} - Contains identity seed and current path
   */
  getKeySeed(): {keySeed: string, pathKey: number} {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const keySeedDb = this.db.listKeys(`${this.prefix}keySeed`);
    if (keySeedDb.length === 0) {
      throw new Error(errorKeySeedNoExistMsg);
    }
    const { keySeedEncrypted, pathKeySeedEncrypted } = JSON.parse(this.db.get(keySeedDb));
    const keySeed = kcUtils.decrypt(this.encryptionKey, keySeedEncrypted);
    const pathKeySeed = kcUtils.decrypt(this.encryptionKey, pathKeySeedEncrypted);
    const pathKey = (utils.hexToBytes(pathKeySeed)).readUInt32BE(0);

    return { keySeed, pathKey };
  }

  /**
   * Gets identity seed and its current path
   * @return {Object} - Contains identity seed and current path
   */
  increaseKeyPath() {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const { keySeed, pathKey } = this.getKeySeed();
    const increasePathKey = pathKey + 1;
    const pathKeyDb = Buffer.alloc(4);
    pathKeyDb.writeUInt32BE(increasePathKey, 0);
    const keySeedEncrypted = kcUtils.encrypt(this.encryptionKey, keySeed);
    const pathKeySeedEncrypted = kcUtils.encrypt(this.encryptionKey, utils.bytesToHex(pathKeyDb));

    this.db.insert(`${this.prefix}keySeed`, JSON.stringify({ keySeedEncrypted, pathKeySeedEncrypted }));
  }

  /**
   * Generates recovery seed and store it into the database
   * @param {String} seed - Master seed
   * @return {String} - Public recovery address
   */
  generateRecoveryAddr(masterSeed: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const root = hdkey.fromMasterSeed(masterSeed);
    const pathRecovery = "m/44'/60'/1'";
    const addrNodeRecovery = root.derive(pathRecovery);
    const privRecovery = addrNodeRecovery._privateKey;
    const addressRecovery = ethUtil.privateToAddress(privRecovery);
    const addressRecoveryHex = utils.bytesToHex(addressRecovery);
    const privRecoveryHex = utils.bytesToHex(privRecovery);
    const privRecoveryHexEncrypted = kcUtils.encrypt(this.encryptionKey, privRecoveryHex);

    this.db.insert(this.prefix + CONSTANTS.IDRECOVERYPREFIX + addressRecoveryHex, privRecoveryHexEncrypted);
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

    this.db.insert(this.prefix + CONSTANTS.PUBKEYBACKUP, pubKeyBackup64);
    return pubKeyBackup64;
  }

  /**
   * Get backup public key
   * @return {String} - Backup public key
   */
  getBackupPubKey() {
    try {
      const keyDb = this.db.listKeys(this.prefix + CONSTANTS.PUBKEYBACKUP);

      if (keyDb.length === 0) {
        return undefined;
      }
      return this.db.get(keyDb);
    } catch (error) {
      return undefined;
    }
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
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    let path = "m/44'/60'/0'/";
    path = `${path + keyProfilePath}/${keyPath}`;
    const { keySeed } = this.getKeySeed();
    const root = hdkey.fromMasterSeed(keySeed);
    const addrNode = root.derive(path);
    const privK = addrNode._privateKey;
    const address = isPublic ? addrNode._publicKey : ethUtil.privateToAddress(addrNode._privateKey);
    const addressHex = utils.bytesToHex(address);
    const privKHex = utils.bytesToHex(privK);
    const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);

    this.db.insert(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * Gets recovery address from the data base
   * @return {String} - Recovery public address
   */
  getRecoveryAddr() {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const keyDb = this.db.listKeys(this.prefix + CONSTANTS.IDRECOVERYPREFIX);

    if (keyDb.length === 0) {
      return undefined;
    }
    return keyDb[0].replace(this.prefix + CONSTANTS.IDRECOVERYPREFIX, '');
  }

  /**
   * @param  {String} mnemonic - String with 12 words
   * @param {Number} pathProfile - Indicates the penultimate layer of the derivation path, for the different identity profiles
   * @param  {Number} numberOfDerivatedKeys - Indicates the last layer of the derivation path, for the different keys of the identity profile
   * @returns {Object} It contains all the keys generated
   */
  generateKeysFromKeyPath(mnemonic: string = bip39.generateMnemonic(), pathProfile: number = 0,
    numberOfDerivedKeys: number = 3): Array<eddsa.PublicKey> {
    if (!bip39.validateMnemonic(mnemonic)) { throw new Error('Mnemonic validation failed'); }
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const root = hdkey.fromMasterSeed(mnemonic);
    const keys = [];
    const path = "m/44'/60'/0'/";

    for (let i = 0; i < numberOfDerivedKeys; i++) {
      const addrNode = root.derive(`${path + pathProfile}/${i}`); // "m/44'/60'/0'/pathProfile/i"
      const privateKey = new eddsa.PrivateKey(addrNode._privateKey);
      const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privateKey.toString());
      const publicKey = privateKey.public();
      keys.push(publicKey);

      this.db.insert(this.prefix + publicKey.toString(), privKHexEncrypted);
    }
    return keys;
  }

  // NOT USED
  // /**
  //  * Get all the identities from dataBase
  //  * @returns {Array} Contains all the identities found in the database
  //  */
  // listIdentities(): Array<string> {
  //   return this.db.listKeys(this.prefix + CONSTANTS.IDPREFIX);
  // }

  /**
   * @returns {String} AddressHex
   */
  generateKeyRand(): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const w = ethWallet.generate();
    const privK = w._privKey;
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);
    const privKHex = utils.bytesToHex(privK);
    const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);

    this.db.insert(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param {String} privKHex - PrivK
   *
   * @returns {String} AddressHex
   */
  importKey(privKHex: string) {
    if (!this.encryptionKey || privKHex.constructor !== String) {
      // KeyContainer not unlocked
      console.error('Error: KeyContainer not unlocked');
      return undefined;
    }
    const privK = utils.hexToBytes(privKHex);
    const address = ethUtil.privateToAddress(privK);
    const addressHex = utils.bytesToHex(address);
    const privKHexEncrypted = kcUtils.encrypt(this.encryptionKey, privKHex);

    // localStorage.setItem(this.prefix + addressHex, privKHexEncrypted);
    this.db.insert(this.prefix + addressHex, privKHexEncrypted);
    return addressHex;
  }

  /**
   * @param  {String} addressHex
   * @param  {Buffer} message
   *
   * @returns {Object} signatureObj
   */
  sign(addressHex: string, message: Buffer): Object {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    // const privKHexEncrypted = localStorage.getItem(this.prefix + addressHex);
    const privKHexEncrypted = this.db.get(this.prefix + addressHex);
    const msgHash = ethUtil.hashPersonalMessage(message);
    const privKHex = kcUtils.decrypt(this.encryptionKey, privKHexEncrypted);
    const sig = ethUtil.ecsign(msgHash, utils.hexToBytes(privKHex));

    return kcUtils.concatSignature(message, msgHash, sig.v, sig.r, sig.s);
  }

  signBaby(publicKeyHex: string, message: Buffer): eddsa.Signature {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    const privateKeyHexEncrypted = this.db.get(this.prefix + publicKeyHex);
    const privateKeyHex = kcUtils.decrypt(this.encryptionKey, privateKeyHexEncrypted);
    const privateKey = new eddsa.PrivateKey(new Buffer(privateKeyHex, 'hex'));
    return privateKey.signMimc7(mimc7HashBuffer(message));
  }

  /**
   * @returns {Array}
   */
  listKeys(): Array<string> {
    return this.db.listKeys(this.prefix);
  }

  /**
   * @param  {String} addressHex
   */
  deleteKey(addressHex: string) {
    // localStorage.removeItem(this.prefix + addressHex);
    this.db.delete(this.prefix + addressHex);
  }

  deleteAll() {
    // localStorage.clear();
    this.db.deleteAll();
  }

  encrypt(m: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    return kcUtils.encrypt(this.encryptionKey, m);
  }

  decrypt(c: string): string {
    if (!this.isUnlock()) { throw new Error(errorLockedMsg) };
    return kcUtils.decrypt(this.encryptionKey, c);
  }
}

module.exports = KeyContainer;
