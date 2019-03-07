// @flow
import type { AxiosPromise } from 'axios';
import { axiosGetDebug, axiosPostDebug, axiosDeleteDebug } from './http-debug';

const axios = require('axios');
/**
 * Class representing the notification server
 * It contains all the relay API calls
 */
class NotificationServer {
  url: string;
  debug: boolean;
  getFn: (string, any) => any;
  postFn: (string, any) => any;
  deleteFn: (string, any) => any;

  /**
   * Initialization notification server object
   * @param {String} url - NameServer Url identifier
   * @param {Boolean} debug - Default to false. Prints Http response into the console if true
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
   * Request login into notification server
   * Login would be done according identity assert protocol
   * Server response would be signature request package
   * @return {Object} Http response
   */
  requestLogin(): AxiosPromise<any, any> {
    return this.getFn(`${this.url}/login`);
  }

  /**
   * Submit login into notification server
   * Login would be done according identity assert protocol
   * Server response would be a jws token
   * @param {String} signedPacket - Identity assertion packet represented into an encoded base64 string
   * @return {Object} Http response
   */
  submitLogin(signedPacket: string): AxiosPromise<any, any> {
    return this.postFn(`${this.url}/login`, { jws: signedPacket });
  }

  /**
   * Set notification on server for an spcefic identity
   * @param {String} idAddr - Identity address
   * @param {String} notification - Notification to be stored
   * @return {Object} Http response
   */
  postNotification(idAddr: string, notification: string): AxiosPromise<any, any> {
    return this.postFn(`${this.url}/notifications/${idAddr}`, { data: notification });
  }

  /**
   * Gets last 10 notifications available for an specific address
   * Request can be done with following parameters:
   * before identifier ['beforeId']: returns previous 10 notifications from the notification identifier
   * after identifier ['afterId']: returns next 10 notifications from the notification identifier
   * @param {String} token - Session token to be identified
   * @param {Number} beforeId - Retrieve notifications less than this identifier
   * @param {Number} afterId - Retrieve notifications greater than this identifier
   * @return {Object} Http response
   */
  getNotifications(token: string, beforeId: number = 0, afterId: number = 0): AxiosPromise<any, any> {
    // Handle http parameters
    let urlParams = '';
    if (beforeId !== 0) {
      urlParams = `?beforeid=${beforeId.toString()}`;
    } else if (afterId !== 0) {
      urlParams = `?afterid=${afterId.toString()}`;
    }

    return this.getFn(`${this.url}/auth/notifications${urlParams}`, { headers: { Authorization: `Bearer ${token}` } });
  }

  /**
   * Delete all notification associated with an specific identity address
   * Requester has to prove to be the owner of the identity adress
   * @param {String} token - Session token to be identified
   * @return {Object} Http response
   */
  deleteNotifications(token: string): AxiosPromise<any, any> {
    return this.deleteFn(`${this.url}/auth/notifications`, { headers: { Authorization: `Bearer ${token}` } });
  }
}

module.exports = NotificationServer;
