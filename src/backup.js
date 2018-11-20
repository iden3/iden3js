const nacl = require('tweetnacl');
const axios = require('axios');
const utils = require('./utils');
const kcUtils = require('./key-container/kc-utils');

class Backup {
  constructor(url) {
    this.url = url; // backup server url
  }

  getPoWDifficulty () {
    return axios.get(`${this.url}/`, {});
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
  backupData (kc, idaddr, ksign, proofOfKSign, type, data, difficulty, relayAddr) {
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
    dataPacket = utils.pow(dataPacket, difficulty);

    // send dataPacket to the backend POST /store/{idaddr}
    return axios.post(`${this.url}/${idaddr}/save`, dataPacket);
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @returns {Object}
   */
  recoverData (idaddr) {
    return axios.post(`${this.url}/${idaddr}/recover`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {Number} timestamp - unixtime
   * @returns {Object}
   */
  recoverDataByTimestamp (idaddr, timestamp) {
    return axios.post(`${this.url}/${idaddr}/recover/timestamp/${timestamp}`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {String} type - typeof the data
   * @returns {Object}
   */
  recoverDataByType (idaddr, type) {
    return axios.post(`${this.url}/${idaddr}/recover/type/${type}`, {});
  }
}

module.exports = Backup;
