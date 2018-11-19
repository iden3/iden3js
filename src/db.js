const nacl = require('tweetnacl');
const axios = require('axios');
const utils = require('./utils');
const kcUtils = require('./key-container/kc-utils');
const CONSTANTS = require('./constants');


/**
 * @param  {String} url - url of the backup system backend
 */
class Db {
  constructor(url) {
    this.prefix = CONSTANTS.DBPREFIX;
    this.url = url; // backup server url
  }

  /**
   * @param  {String} key
   * @param  {String} value
   */
  insert(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  /**
   * @param  {String} key
   * @returns {String}
   */
  get(key) {
    return localStorage.getItem(this.prefix + key);
  }

  /**
   * @param  {String} key
   */
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  deleteAll() {
    localStorage.clear();
  }

  /**
   * @param  {Object} kc
   * @param  {String} idaddr - hex representation of idaddr
   * @param  {String} ksign - address of the KSign to use to sign
   * @param  {Object} proofOfKSign
   * @param  {String} type
   * @param  {String} data
   * @param  {String} relayAddr
   * @returns {Object}
   */
  backupData(kc, idaddr, ksign, proofOfKSign, type, data, relayAddr) {
    // TODO relayAddr will be setted in a global config, not passed in this function as parameter
    /*
      types:
        - claim
        - key/identity
        - received Proof
        - received Claim
        - logs (history)
        - ...
    */
    const dataEncrypted = kcUtils.encrypt(kc.encryptionKey, data);
    let dataPacket = {
      idaddrhex: idaddr,
      data: dataEncrypted,
      datasignature: kc.sign(ksign, dataEncrypted).signature,
      type: type,
      ksign: ksign,
      proofofksignhex: proofOfKSign,
      relayaddr: relayAddr,
      timestamp: 0, // will be setted by the backend
      nonce: 0 // will be setted in next step of PoW
    };
    // PoW
    dataPacket = utils.pow(dataPacket, 2);

    // send dataPacket to the backend POST /store/{idaddr}
    return axios.post(`${this.url}/${idaddr}/save`, dataPacket);
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @returns {Object}
   */
  recoverData(idaddr) {
    return axios.post(`${this.url}/${idaddr}/recover`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {Number} timestamp - unixtime
   * @returns {Object}
   */
  recoverDataByTimestamp(idaddr, timestamp) {
    return axios.post(`${this.url}/${idaddr}/recover/timestamp/${timestamp}`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {String} type - typeof the data
   * @returns {Object}
   */
  recoverDataByType(idaddr, type) {
    return axios.post(`${this.url}/${idaddr}/recover/type/${type}`, {});
  }

  export(kc, idAddr, ksign) {
    if (!kc.encryptionKey) {
      // KeyContainer not unlocked
      console.log("Error: KeyContainer not unlocked");
      return undefined;
    }
    let dbExp = {};

    for (let i = 0; i < localStorage.length; i++) {
      // get only the stored data related to db (that have the prefix)
      if (localStorage.key(i).indexOf(this.prefix) !== -1) {
        dbExp[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
      }
    }
    const dbExpStr = JSON.stringify(dbExp);

    const dbEncr = kcUtils.encrypt(kc.encryptionKey, dbExpStr);
    return dbEncr;
  }

  import (kc, dbEncr) {
    const dbExpStr = kcUtils.decrypt(kc.encryptionKey, dbEncr);
    const dbExp = JSON.parse(dbExpStr);
    for (var property in dbExp) {
      if (dbExp.hasOwnProperty(property)) {
        localStorage.setItem(property, dbExp[property]);
      }
    }
  }
}

module.exports = Db;
