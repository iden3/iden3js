const nacl = require('tweetnacl');
const axios = require('axios');
const utils = require('./utils');
const kcUtils = require('./key-container/kc-utils');

class Backup {
  constructor(url, version=0) {
    this.url = url; // backup server url
    this.version = version; // current last used version
    this.difficulty = 2;
  }

  getPoWDifficulty() {
    if (this.url===undefined) {
      console.log("backup url not defined");
      return;
    }
    let self = this;
    return axios.get(`${this.url}/`, {}).then(function(res) {
      self.difficulty = res.data.powdifficulty;
      return res;
    });
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
    if (this.url===undefined) {
      console.log("backup url not defined");
      return;
    }
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
    this.version++;
    const dataEncrypted = kcUtils.encrypt(kc.encryptionKey, data);
    let dataPacket = {
      idaddrhex: idaddr,
      data: dataEncrypted,
      datasignature: kc.sign(ksign, dataEncrypted).signature,
      type: type,
      ksign: ksign,
      proofofksignhex: proofOfKSign,
      relayaddr: relayAddr,
      version: this.version, // version from the last stored value
      nonce: 0 // will be setted in next step of PoW
    };
    // PoW
    dataPacket = utils.pow(dataPacket, this.difficulty);

    // send dataPacket to the backend POST /store/{idaddr}
    let self = this;
    return axios.post(`${this.url}/${idaddr}/save`, dataPacket)
      .then(function(res) {
        self.version = res.data.version;
        return;
      })
      .catch(function(err) {
        console.error(error);
      })
      .then(function() {
        return;
      });
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @returns {Object}
   */
  recoverData(idaddr) {
    if (this.url===undefined) {
      console.log("backup url not defined");
      return;
    }
    return axios.post(`${this.url}/${idaddr}/recover`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {Number} version - unixtime
   * @returns {Object}
   */
  recoverDataSinceVersion(idaddr, version) {
    if (this.url===undefined) {
      console.log("backup url not defined");
      return;
    }
    return axios.post(`${this.url}/${idaddr}/recover/version/${version}`, {});
  }

  /**
   * @param  {String} idaddr - hex representation of idaddr
   * @param {String} type - typeof the data
   * @returns {Object}
   */
  recoverDataByType(idaddr, type) {
    if (this.url===undefined) {
      console.log("backup url not defined");
      return;
    }
    return axios.post(`${this.url}/${idaddr}/recover/type/${type}`, {});
  }
}

module.exports = Backup;
