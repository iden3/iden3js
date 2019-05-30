// @flow
import type { AxiosPromise } from 'axios';

import { axiosGetDebug, axiosPostDebug } from './http-debug';

const axios = require('axios');
const login = require('../protocols/login');
const KeyContainer = require('../key-container/key-container');
const proofs = require('../protocols/proofs');

/**
 * Class representing a the NameServer
 * It contains all the relay API calls
 * @param {String} url
 */
class NameServer {
  url: string;
  debug: boolean;
  getFn: (string, any) => any;
  postFn: (string, any) => any;

  /**
   * Initialization name server object
   * @param {String} url - NameServer Url identifier
   */
  constructor(url: string, debug: boolean = false) {
    this.url = url;
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
   * Construct proper object to bind an identity adress to a label
   * Name resolver server creates the claim binding { Label - Identity address }
   * @param  {Object} kc - Keycontainer
   * @param  {String} ksing - ksign public key used to sign the request
   * @param  {Object} proofKSign - AuthorizeKSignSecp256k1 ProofClaim of ksign
   * @param  {String} id - Identity address
   * @param  {String} name - Label to bind
   * @return {Object} Http response
   */
  bindId(kc: KeyContainer, ksign: string, proofKSign: proofs.ProofClaim,
    id: string, name: string): AxiosPromise<any, any> {
    const assignNameSignedReq = login.signGenericSigV01(kc, id,
      ksign, proofKSign, 600, { assignName: name });
    return this.postFn(`${this.url}/names`, { jws: assignNameSignedReq });
  }

  /**
   * Search name string into the name resolver and it retrieves the corresponding public address
   * @param {String} name - Label to search into the name resolver tree
   * @return {Object} Http response
   */
  resolveName(name: string): AxiosPromise<any, any> {
    return this.getFn(`${this.url}/names/${name}`);
  }
}

module.exports = NameServer;
