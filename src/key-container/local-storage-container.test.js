const chai = require('chai');
const Db = require('../db/db');
const LocalStorageContainer = require('./local-storage-container');
const kcUtils = require('./kc-utils');

const { expect } = chai;

describe('[Local-storage-container] Test single functions', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db();
    keyContainer = new LocalStorageContainer(dataBase);
  });

  it('Get master seed without generate it one', () => {
    keyContainer.deleteAll();
    keyContainer.unlock('pass');
    const mnemonic = keyContainer.getMasterSeed();
    expect(mnemonic).to.be.equal(undefined);
    keyContainer.lock('pass');
  });

  it('Generate random master seed and retrieve it from local storage', () => {
    keyContainer.unlock('pass');
    const ack = keyContainer.generateMasterSeed();
    if (ack) {
      const mnemonic = keyContainer.getMasterSeed();
      keyContainer.lock();
      expect(mnemonic).to.be.not.equal(undefined);
    }
  });

  it('Generate known master seed, save it and access with different passphrase', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    const ack = keyContainer.generateMasterSeed(mnemonic);
    if (ack) {
      keyContainer.lock();
      keyContainer.unlock('passwrong');
      const mnemonicDb = keyContainer.getMasterSeed();
      keyContainer.lock();
      expect(mnemonicDb).to.be.equal(undefined);
    }
  });

  it('Save a known master seed and retrieve it from local storage', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    const ack = keyContainer.generateMasterSeed(mnemonic);
    if (ack) {
      const seedDb = keyContainer.getMasterSeed();
      keyContainer.lock();
      expect(mnemonic).to.be.equal(seedDb);
    }
  });

  it('Generate recovery adress and retrieve it from database', () => {
    keyContainer.unlock('pass');
    const seedDb = keyContainer.getMasterSeed();
    const recoveryAddr = keyContainer.generateRecoveryAddr(seedDb);
    const recoveryAddrFromDatabase = keyContainer.getRecoveryAddr();
    expect(recoveryAddr).to.be.equal(recoveryAddrFromDatabase);
    keyContainer.lock();
  });

  it('Generate key seed', () => {
    keyContainer.unlock('pass');
    const masterSeed = keyContainer.getMasterSeed();
    const ack = keyContainer.generateKeySeed(masterSeed);
    if (ack) {
      const { keySeed, pathKey } = keyContainer.getKeySeed();
      keyContainer.lock();
      expect(pathKey).to.be.equal(0);
      expect(keySeed).to.be.equal('drift true reunion shoulder achieve stereo blame absurd evolve elbow include hospital hint evil goddess child shuffle devote game power salt ensure beyond brush');
    }
  });

  it('Generate keys {operational, recovery, revoke} from key path 0', () => {
    keyContainer.unlock('pass');
    const { keySeed, pathKey } = keyContainer.getKeySeed();
    const { keys } = keyContainer.generateKeysFromKeyPath(keySeed, pathKey);
    keyContainer.increaseKeyPath();
    const pathKey1 = (keyContainer.getKeySeed()).pathKey;
    expect(pathKey1).to.be.equal(1);
    expect(keys[0]).to.be.not.equal(undefined);
    expect(keys[1]).to.be.not.equal(undefined);
    expect(keys[2]).to.be.not.equal(undefined);
    keyContainer.lock();
  });

  it('Generate single key from key path 0', () => {
    keyContainer.unlock('pass');
    const keyProfilePath = 0;
    const keyPath = 0;
    const newAddressHex = keyContainer.generateSingleKey(keyProfilePath, keyPath);
    expect(newAddressHex).to.be.equal('0xc7d89fe96acdb257b434bf580b8e6eb677d445a9');
    keyContainer.lock();
  });

  it('Generate backup key and store it', () => {
    keyContainer.unlock('pass');
    const masterSeed = keyContainer.getMasterSeed();
    const pubKeyBackup = keyContainer.generateKeyBackUp(masterSeed);
    const getKeyBackup = keyContainer.getBackupPubKey();
    expect(getKeyBackup).to.be.not.equal(undefined);
    expect(getKeyBackup).to.be.equal(pubKeyBackup);
    keyContainer.lock();
  });

  it('Encrypt using backup public key and decrypt with mnemonic', () => {
    keyContainer.unlock('pass');
    const pubKeyBackup = keyContainer.getBackupPubKey();
    const data = 'Data example';
    // Encrypted data
    const dataEn = kcUtils.encryptBox(pubKeyBackup, data);
    // Decrypt data with master seed
    const masterSeed = keyContainer.getMasterSeed();
    const keyPair = keyContainer.getPrivKeyBackUpFromSeed(masterSeed);
    const dataOriginal = kcUtils.decryptBox(keyPair.privateKey, keyPair.publicKey, dataEn);
    expect(dataOriginal).to.be.equal(data);
    keyContainer.lock();
  });
});

describe('[Local-storage-container] Test identity flow', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db();
    keyContainer = new LocalStorageContainer(dataBase);
    keyContainer.deleteAll();
  });

  it('Create keys for first identity', () => {
    keyContainer.unlock('pass');
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    const ack = keyContainer.generateMasterSeed(mnemonic);
    if (ack) {
      const keys = keyContainer.createKeys();
      keyContainer.lock();
      expect(keys).to.be.not.equal(undefined);
      expect(keys[0]).to.be.equal('0x03c2e48632c87932663beff7a1f6deb692cc61b041262ae8f310203d0f5ff57833');
      expect(keys[1]).to.be.equal('0x037dc67e977ff1943e5b9d137adc3decb72890ecf8631eb3459630f63de47d841b');
      expect(keys[2]).to.be.equal('0x03ebbbe4f9310268d87f65c7b6846e2c412d77383c84996ef4238716c6c6130a3f');
    }
  });

  it('Check state of key seed and key path', () => {
    keyContainer.unlock('pass');
    const objectKeySeed = keyContainer.getKeySeed();
    expect(objectKeySeed.pathKey).to.be.equal(1);
  });

  it('Create keys for second identity', () => {
    keyContainer.unlock('pass');
    const keys = keyContainer.createKeys();
    keyContainer.lock();
    expect(keys).to.be.not.equal(undefined);
    expect(keys[0]).to.be.equal('0x0279f9574efb8f4dbffd07f386bb4736f516bd75824eae7ebda3c87ee18ac3618c');
    expect(keys[1]).to.be.equal('0x03c9ee27039102f1b403b6cd542e9acd21cdba83ed0a32caf0561fed2e693c4640');
    expect(keys[2]).to.be.equal('0x03665116518b496b9c6f9d12f64cda99d0956c970cc3b7db6d62fb1759d86eeaa6');
  });
});
