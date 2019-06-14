const ethUtil = require('ethereumjs-util');
const bip39 = require('bip39');

const KeyContainer = require('../key-container/key-container');
const identityUtils = require('./identity-utils.js');

/**
 * Class representing a user identity
 * Manage all possible actions related to identity usage
 */
class Identity {
  /**
   * @param {Object} db - database to use
   * @param {Object} keyContainer - keyContainer to use
   * @param {String} id - id in base58 string willing to load
   * @param {String} keyOperationalPub - string public key
   * @param {String} keyDisable - string ethereum key
   * @param {String} keyReenable - string ethereum key
   */
  constructor(db, keyContainer, id, keyOperationalPub, keyDisable, keyReenable, proofKeyOperationalPub, proofKeyDisable, proofKeyReenable) {
    this.db = db;
    this.keyContainer = keyContainer;

    this.keyOperationalPub = keyOperationalPub;
    this.keyDisable = keyDisable;
    this.keyReenable = keyReenable;

    this.proofKeyOperationalPub = proofKeyOperationalPub;
    this.proofKeyDisable = proofKeyDisable;
    this.proofKeyReenable = proofKeyReenable;

    this.id = id;
  }

  /**
   * @param {Object} db - database to use
   * @param {String} passphrase - passphrase to encrypt/decrypt the keyContainer
   * @param {String} seed - (optional) mnemonic seed to generate the keys
   */
  static create(db, passphrase, seed) {
    const keyContainer = new KeyContainer(db);
    keyContainer.unlock(passphrase);

    if (seed === undefined) {
      seed = bip39.generateMnemonic();
    }
    keyContainer.setMasterSeed(seed);
    // seed = keyContainer.getMasterSeed();
    const keys = keyContainer.createKeys();

    const keyOperationalPub = keys.kOp;
    db.insert('keyOperationalPub', keyOperationalPub);

    const keyDisablePub = keys.kDis;
    const keyDisable = `0x${ethUtil.pubToAddress(keyDisablePub, true).toString('hex')}`;
    db.insert('keyDisable', keyDisable);
    const keyReenablePub = keys.kReen;
    const keyReenable = `0x${ethUtil.pubToAddress(keyReenablePub, true).toString('hex')}`;
    db.insert('keyReenable', keyReenable);

    const {
      id, proofKeyOperationalPub, proofKeyDisable, proofKeyReenable,
    } = identityUtils.calculateIdGenesis(keyOperationalPub, keyReenable, keyDisable);
    db.insert('id', id);
    db.insert(id, true);

    db.insert('proofKeyOperationalPub', proofKeyOperationalPub);
    db.insert('proofKeyDisable', proofKeyDisable);
    db.insert('proofKeyReenable', proofKeyReenable);

    return new Identity(
      db, keyContainer, id,
      keyOperationalPub, keyDisable, keyReenable,
      proofKeyOperationalPub, proofKeyDisable, proofKeyReenable,
    );
  }

  /**
   * @param {Object} db - database to use
   * @param {String} id - id in base58 string willing to load
   */
  static load(db, id) {
    if (db.get(id) === null) {
      throw new Error(`id ${id} not found in db`);
    }
    const keyOperationalPub = db.get('keyOperationalPub');
    const keyDisable = db.get('keyDisable');
    const keyReenable = db.get('keyReenable');
    const proofKeyOperationalPub = db.get('proofKeyOperationalPub');
    const proofKeyDisable = db.get('proofKeyDisable');
    const proofKeyReenable = db.get('proofKeyReenable');
    const keyContainer = new KeyContainer(db);
    return new Identity(
      db, keyContainer, id,
      keyOperationalPub, keyDisable, keyReenable,
      proofKeyOperationalPub, proofKeyDisable, proofKeyReenable,
    );
  }
}

module.exports = Identity;
