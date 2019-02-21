// @flow
import type { AxiosPromise } from 'axios';

import { axiosGetDebug, axiosPostDebug } from './http-debug';

const axios = require('axios');
const utils = require('../utils');

/**
 * Class representing a name resolver service
 * It contains all the name resolver API calls
 */
class NameResolver {
  url: string;
  debug: boolean;
  getFn: (string, any) => any;
  postFn: (string, any) => any;
  /**
   * Initialization name resolver object
   * @param {string} url - Relay Url identifier
   */
  constructor(url: string) {
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
   * @param  {string} idAddr - Identity address
   * @param  {string} keyOperationalPub - Key used to sign the message sent
   * @param  {string} name - Label to bind
   * @return {AxiosPromise} Promise with http response: empty if OK, otherwise Error
   */
  bindID(kc: Object, idAddr: string, keyOp: string, proofKeyOp: string, name: string): AxiosPromise<any, ?Error> {
    const idBytes = utils.hexToBytes(idAddr);
    const nameBytes = Buffer.from(name);
    let msgBytes = Buffer.from([]);

    msgBytes = Buffer.concat([msgBytes, idBytes]);
    msgBytes = Buffer.concat([msgBytes, nameBytes]);

    const signatureObj = kc.sign(keyOp, utils.bytesToHex(msgBytes));
    const bindIdMsg = {
      idAddr,
      name,
      signature: signatureObj.signature,
      kSignPk: keyOp,
      proofKSign: proofKeyOp,
    };

    return this.postFn(`${this.url}/names`, bindIdMsg);
  }

  /**
   * Search name string into the name resolver and it retrieves the corresponding public address
   * @param {string} name - Label to search into the name resolver tree
   * @return {AxiosPromise} Promise with http response: empty if OK, otherwise Error
   */
  resolveName(name: string): AxiosPromise<any, ?Error> {
    return this.getFn(`${this.url}/names/${name}`);
  }

  /**
   * Retrieve root and contract root of name resolver service
   * @return {AxiosPromise} Promise with http response: empty if OK, otherwise Error
   */
  getRoot(): AxiosPromise<any, ?Error> {
    return this.getFn(`${this.url}/root`);
  }
}

module.exports = NameResolver;
