// @flow
import type { AxiosPromise } from 'axios';
import { axiosGetDebug, axiosPostDebug } from './http-debug';

const axios = require('axios');
const utils = require('../utils');

/**
 * Class representing a name resolver service
 * It contains all the name resolver API calls
 */
export class NameResolver {
  url: String;
  getFn: (string, any) => any;
  postFn: (string, any) => any;
  /**
   * Initialization name resolver object
   * @param {String} url - Relay Url identifier
   */
  constructor(url: String) {
    this.url = url;
    if (this.debug) {
      this.getFn = axiosGetDebug;
      this.postFn = axiosPostDebug;
    } else {
      this.getFn = axios.get;
      this.postFn = axios.post;
    }
  }

  /**
   * Construct proper object to bind an identity adress to a label
   * Name resolver server creates the claim binding { Label - Identity address }
   * @param  {Object} kc - Keycontainer
   * @param  {String} idAddr - Identity address
   * @param  {String} keyOperationalPub - Key used to sign the message sent
   * @param  {String} name - Label to bind
   * @return {AxiosPromise} Promise with http response: empty if OK, otherwise Error
   */
  bindID(kc: Object, idAddr: String, keyOperationalPub: String, name: String): AxiosPromise<any, ?Error> {
    const idBytes = utils.hexToBytes(idAddr);
    const nameBytes = Buffer.from(name);
    let msgBytes = Buffer.from([]);

    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    const signatureObj = kc.sign(keyOperationalPub, utils.bytesToHex(msgBytes));
    const bindIDMsg = {
      idAddr,
      name,
      signature: signatureObj.signature,
      kSignPk: keyOperationalPub,
    };

    return axios.postFn(`${this.url}/names`, bindIDMsg);
  }

  /**
   * Search name string into the name resolver and it retrieves the corresponding public address
   * @param {String} name - Label to search into the name resolver tree
   * @return {AxiosPromise} Promise with http response: empty if OK, otherwise Error
   */
  resolveName(name: String): AxiosPromise<any, ?Error> {
    return axios.get(`${this.url}/names/${name}`);
  }
}
