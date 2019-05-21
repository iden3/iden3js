// @flow
import type { AxiosPromise } from 'axios';

import { axiosGetDebug, axiosPostDebug } from './http-debug';

// const nacl = require('tweetnacl');
const axios = require('axios');
// const utils = require('../utils');
// const kcUtils = require('../key-container/kc-utils');

type Error = {
  error: string,
};

/**
 * Backup service allows uploading and downloading an encrypted export of the
 * wallet database.
 */
class Backup {
  url: string;
  username: string;
  password: string;
  debug: boolean;
  getFn: (string, any) => any;
  postFn: (string, any) => any;
  // version: number;
  // difficulty: number;

  /**
   * @param{String} url - backup service url
   * @param{String} username
   * @param{String} password
   */
  constructor(url: string, username: string, password: string, debug: boolean = false) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.debug = debug;
    if (this.debug) {
      this.getFn = axiosGetDebug;
      this.postFn = axiosPostDebug;
    } else {
      this.getFn = axios.get;
      this.postFn = axios.post;
    }
  }

  /**
   * Upload a backup to the backup server.
   * @param{String} backup - base64 encoded encrypted backup
   * @returns{AxiosPromise<?Error>} - Promise with http response: empty if OK, otherwise Error
   */
  upload(backup: string): AxiosPromise<any, ?Error> {
    const data = {
      username: this.username,
      password: this.password,
      backup,
    };
    return this.postFn(`${this.url}/backup/upload`, data);
  }

  /**
   * Download the current backup from the backup server.
   * @returns{AxiosPromise<Error | {backup: string}>} - Promise with http response: backup if OK, otherwise Error
   */
  download(): AxiosPromise<any, Error | {backup: string}> {
    const data = {
      username: this.username,
      password: this.password,
    };
    return this.postFn(`${this.url}/backup/download`, data);
  }

  /**
   * Register the username and password to the backup server.
   * @returns{AxiosPromise<?Error>} - Promise with http response: empty if OK, otherwise Error
   */
  register(): AxiosPromise<{username: string, password: string}, ?Error> {
    const data = {
      username: this.username,
      password: this.password,
    };
    return this.postFn(`${this.url}/register`, data);
  }

  // constructor(url: string, version: number = 0) {
  //   this.url = url; // backup server url
  //   this.version = version; // current last used version
  //   this.difficulty = 1;
  // }

  // getPoWDifficulty() {
  //   if (!this.url) {
  //     console.error('backup url not defined');
  //     return undefined;
  //   }
  //   const self = this;
  //   return axios.get(`${this.url}/`, {}).then((res) => {
  //     self.difficulty = res.data.powdifficulty;
  //     return res;
  //   });
  // }

  // /**
  //  * @param  {Object} kc
  //  * @param  {String} idaddr - hex representation of idaddr
  //  * @param  {String} ksign - address of the KSign to use to sign
  //  * @param  {Object} proofOfKSign
  //  * @param  {String} type
  //  * @param  {String} data
  //  * @param  {String} relayAddr
  //  * @returns {Object}
  //  */
  // backupData(kc, idAddr, kSign, proofOfKSign, type, data, relayAddr) {
  //   if (!this.url) {
  //     console.error('backup url not defined');
  //     return null;
  //   }
  //   // TODO relayAddr will be set in a global config, not passed in this function as parameter
  //   /*
  //     types:
  //       - claim
  //       - key/identity
  //       - received Proof
  //       - received Claim
  //       - logs (history)
  //       - ...
  //   */
  //   this.version += 1;
  //   const encryptedData = kcUtils.encrypt(kc.encryptionKey, data);
  //   let dataPacket = {
  //     idaddrhex: idAddr,
  //     data: encryptedData,
  //     datasignature: kc.sign(kSign, encryptedData).signature,
  //     type,
  //     ksign: kSign,
  //     proofofksignhex: proofOfKSign,
  //     relayaddr: relayAddr,
  //     version: this.version, // version from the last stored value
  //     nonce: 0, // will be set in next step of PoW
  //   };
  //   // PoW
  //   dataPacket = utils.pow(dataPacket, this.difficulty);

  //   // send dataPacket to the backend POST /store/{idAddr}
  //   const self = this;
  //   return axios.post(`${this.url}/${idAddr}/save`, dataPacket)
  //     .then((res) => {
  //       self.version = res.data.version;
  //       return res.data;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw new Error(error);
  //     });
  // }

  // /**
  //  * @param  {String} idaddr - hex representation of idaddr
  //  * @returns {Object}
  //  */
  // recoverData(idaddr) {
  //   if (!this.url) {
  //     console.error('backup url not defined');
  //     return undefined;
  //   }
  //   return axios.post(`${this.url}/${idaddr}/recover`, {});
  // }

  // /**
  //  * @param  {String} idaddr - hex representation of idaddr
  //  * @param {Number} version - unixtime
  //  * @returns {Object}
  //  */
  // recoverDataSinceVersion(idaddr, version) {
  //   if (!this.url) {
  //     console.error('backup url not defined');
  //     return undefined;
  //   }
  //   return axios.post(`${this.url}/${idaddr}/recover/version/${version}`, {});
  // }

  // /**
  //  * @param  {String} idaddr - hex representation of idaddr
  //  * @param {String} type - typeof the data
  //  * @returns {Object}
  //  */
  // recoverDataByType(idaddr, type) {
  //   if (!this.url) {
  //     console.error('backup url not defined');
  //     return undefined;
  //   }
  //   return axios.post(`${this.url}/${idaddr}/recover/type/${type}`, {});
  // }
}

module.exports = Backup;
