const api = require('../api/api');
const utils = require('../utils/utils');
const kcUtils = require('../key-container/kc-utils');
const CONSTANTS = require('../constants');

class Backup {
  constructor(url, version = 0) {
    this.url = url; // backup server url
    this.version = version; // current last used version
    this.difficulty = 1;
  }

  getPoWDifficulty() {
    /* return api.getPoWDifficulty(this.url, {})
      .then((res) => {
        this.difficulty = res.data.powdifficulty;
        return res;
      }); */
    return this.url
      ? api.getPoWDifficulty(this.url, {})
        .then((res) => {
          this.difficulty = res.data.powdifficulty;
          return res;
        })
      : Promise.reject(new Error('Backup server url not defined'));
  }

  /**
   * @param  {Object} kc
   * @param  {String} idAddr - hex representation of identity address
   * @param  {String} kSign - address of the KSign to use to sign
   * @param  {Object} proofOfKSign
   * @param  {String} type
   * @param  {String} data
   * @param  {String} relayAddr
   *
   * @returns {Object}
   */
  async backupData(kc, idAddr, kSign, proofOfKSign, type, data, relayAddr) {
    if (!this.url) {
      console.error('backup url not defined');
      return null;
    }
    // TODO relayAddr will be set in a global config, not passed in this function as parameter
    /*
      types:
        - claim
        - key/identity
        - received Proof
        - received Claim
        - logs (history)
        - ...
    */
    const encryptedData = kcUtils.encrypt(kc.encryptionKey, data);
    this.version += 1;
    const dataPacket = utils.pow({
      idaddrhex: idAddr,
      data: encryptedData,
      datasignature: kc.sign(kSign, encryptedData).signature,
      type,
      ksign: kSign,
      proofofksignhex: proofOfKSign,
      relayaddr: relayAddr,
      version: this.version, // version from the last stored value
      nonce: 0, // will be set in next step of PoW
    }, this.difficulty);

    const backupRes = await api.backupPrivateFolder(this.url, idAddr, dataPacket); // send dataPacket to the backend POST /store/{idAddr}
    this.version = this.backupRes.data.version;
    return Promise.resolve(backupRes.data);
    /*  .then((res) => {
        this.version = res.data.version;
        return res.data;
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      }); */
  }

  /**
   * Recover data from the backup folder. We can apply one selector.
   *
   * @param  {String} idAddr - hex representation of the identity address
   *
   * @returns {Promise} with the data recovered
   */
  recoverData(idAddr, by = CONSTANTS.PRIVATE_FOLDER.SELECTORS.DEFAULT, selector) {
    // return api.recoverPrivateFolder(this.url, idaddr);
    return this.url
      ? api.recoverPrivateFolder(this.url, idAddr, by, selector)
      : Promise.reject(new Error('Backup server url not defined'));
  }

  /**
   * @param  {String} idaddr - hex representation of the identity address
   * @param {Number} version - unixtime
   * @returns {Object}
   */
  /* recoverDataSinceVersion(idaddr, version) {
    // return axios.post(`${this.url}/${idaddr}/recover/version/${version}`, {});
    // api.recoverPrivateFolder(this.url, idaddr, { name: 'version', selector: version });
    return this.url
      ? api.recoverPrivateFolder(this.url, idaddr, { name: CONSTANTS.PRIVATE_FOLDER.SELECTORS.VERSION, selector: version })
      : Promise.reject(new Error('Backup server url not defined'));
  } */

  /**
   * @param  {String} idaddr - hex representation of the identity address
   * @param {String} type - type of the data
   * @returns {Object}
   */
  /* recoverDataByType(idaddr, type) {
    // return axios.post(`${this.url}/${idaddr}/recover/type/${type}`, {});
    // return api.recoverPrivateFolder(this.url, idaddr, { name: 'type', selector: type });
    return this.url
      ? api.recoverPrivateFolder(this.url, idaddr, { name: CONSTANTS.PRIVATE_FOLDER.SELECTORS.TYPE, selector: type })
      : Promise.reject(new Error('Backup server url not defined'));
  } */
}

module.exports = Backup;
