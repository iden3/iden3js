// @flow
import type { AxiosPromise } from 'axios';
import { axiosGetDebug, axiosPostDebug, axiosDeleteDebug } from './http-debug';

const axios = require('axios');
const kCont = require('../key-container/key-container');
const login = require('../protocols/login');
const proofs = require('../protocols/proofs');
/**
 * Class representing the notification server
 * It contains all the relay API calls
 * @param {String} url
 */
class NotificationServer {
  url: string;
  debug: boolean;
  getFn: (string, any) => any;
  postFn: (string, any) => any;
  deleteFn: (string, any) => any;

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
      this.deleteFn = axiosDeleteDebug;
    } else {
      this.getFn = axios.get;
      this.postFn = axios.post;
      this.deleteFn = axios.delete;
    }
  }

  /**
   * Set notification on server for an spcefic identity
   * @param {String} idAddr - Identity address
   * @return {Object} Http response
   */
  postNotification(idAddr: string, notification: string): AxiosPromise<any, any> {
    return this.postFn(`${this.url}/notifications/${idAddr}`, { jws: notification });
  }

  /**
   * Gets last 10 notifications available for an specific address
   * Request can be done with following parameters:
   * before identifier ['beforeId']: returns previous 10 notifications from the notificatio identifier
   * after identifier ['afterId']: returns next 10 notifications from the notificatio identifier
   * @param {kCont.KeyContainer} kc - Keycontainer
   * @param {String} idAddr - Identity address
   * @param {String} kSign - Key to sign data packet
   * @param {proofs.ProofClaim} proofKSign - Proof that key signature belongs to identity address
   * @param {Number} timeoutDelta - Expiration in seconds starting on current time
   * @param {Number} beforeId - Get 10 notifications before this
   * @param {Number} afterId - Get 10 notifications after this
   * @return {Object} Http response
   */
  getNotifications(kc: kCont.KeyContainer, idAddr: string, kSign: string, proofKSign: proofs.ProofClaim,
    timeoutDelta: number = 600, beforeId: number = 0, afterId: number = 0): AxiosPromise<any, any> {
    // Take url parameters
    let urlParams = '';
    if (beforeId !== 0) {
      urlParams = `?beforeid =${beforeId.toString()}`;
    } else if (afterId !== 0) {
      urlParams = `?afterid =${afterId.toString()}`;
    }
    // Build generic signed packet
    const signedPacket = login.signGenericSigV01(kc, idAddr, kSign, proofKSign, timeoutDelta, {});
    // Build input packet to prove that the requester owns identity address
    const fullRequest = {
      idAddr,
      signedPacket,
      proofKSign,
    };
    return this.postFn(`${this.url}/notifications${urlParams}`, { jws: fullRequest });
  }

  /**
   * Delete all notification associted with an specific identity address
   * Request has prove to be the owner of the identity adress
   * @param {kCont.KeyContainer} kc - Keycontainer
   * @param {String} idAddr - Identity address
   * @param {String} kSign - Key to sign data packet
   * @param {proofs.ProofClaim} proofKSign - Proof that key signature belongs to identity address
   * @param {Number} timeoutDelta - Expiration in seconds starting on current time
   * @return {Object} Http response
   */
  deleteNotifications(kc: kCont.KeyContainer, idAddr: string, kSign: string, proofKSign: proofs.ProofClaim,
    timeoutDelta: number = 600): AxiosPromise<any, any> {
    // Build generic signed packet
    const signedPacket = login.signGenericSigV01(kc, idAddr, kSign, proofKSign, timeoutDelta, {});
    // Build input packet to prove that the requester owns identity address
    const fullRequest = {
      idAddr,
      signedPacket,
      proofKSign,
    };
    return this.deleteFn(`${this.url}/notifications`, { jws: fullRequest });
  }
}

module.exports = NotificationServer;
