const axios = require('axios');
const utils = require('../utils');
const qrcode = require('qrcode-generator');

// const WebSocket = require('ws'); // for nodejs tests

/**
 * Generates the challenge with the current unixtime
 * @returns {String}
 */
function challenge() {
  let unixTime = Math.round((new Date()).getTime() / 1000);
  let r = Math.random();
  let randStr = r.toString(36).substr(7, 4);
  return 'uuid-' + unixTime + "-" + randStr; // challenge of 20 characters length
}

/**
 * Creates the Auth class object, opens a websocket connection with the backend
 * @param  {Object} kc - KeyContainer object
 * @param  {String} ksign - KSign address
 * @param  {String} url
 * @param  {String} wsurl
 * @param  {String} wsurl
 * @param  {Param} successCallback
 */
class Auth {
  constructor(kc, ksign, url, wsurl, successCallback) {
    this.kc = kc;
    this.ksign = ksign;
    this.challenge = challenge();
    this.signature = kc.sign(ksign, this.challenge).signature;
    this.url = url;
    this.wsurl = wsurl + '/ws/' + this.challenge;
    this.successCallback = successCallback;
    this.ws = new WebSocket(this.wsurl);
    this.ws.onmessage = function(msg) {
      var authData = JSON.parse(msg.data);
      successCallback(authData);
    }
    this.ws.onopen = function() {
      console.log("open ws");
      this.send(challenge);
    }
    this.send = function(data) {
      console.log("sending data", data);
      this.ws.send(data);
    }
  }

  /**
   * Returns the QR hex data
   * @returns {String}
   */
  qrHex() {
    let b = new Buffer([]);
    b = Buffer.concat([
      b,
      Buffer.from(this.challenge)
    ]);
    b = Buffer.concat([
      b,
      utils.hexToBytes(this.signature)
    ]);
    b = Buffer.concat([
      b,
      Buffer.from(this.url)
    ]);
    return utils.bytesToHex(b);
  }

  /**
   * Prints the QR hex data into a QR image in a given divId
   * @param {String} - Div id where to place the QR image
   */
  printQr(divId) {
    let qrHex = this.qrHex();
    var typeNumber = 9;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(qrHex);
    qr.make();
    document.getElementById(divId).innerHTML = qr.createImgTag();
  }
}

/**
 * Parses the QR Hex data into an object
 * @param  {String} h - Hex string
 * @returns {Object} - Object containing challenge, signature, url
 */
var parseQRhex = function(h) {
  let b = utils.hexToBytes(h);
  return {
    challenge: b.slice(0, 20).toString(), // 20 is the length of the challenge
    signature: utils.bytesToHex(b.slice(20, 85)),
    url: b.slice(85, b.length).toString()
  };
}

/**
 * @param  {String} url
 * @param  {String} idaddr
 * @param  {String} challenge
 * @param  {String} signature
 * @param  {String} ksign
 * @param  {Object} ksignProof
 * @returns
 */
var resolv = function(url, idaddr, challenge, signature, ksign, ksignProof) {
  let authMsg = {
    address: idaddr,
    challenge: challenge,
    signature: signature,
    ksign: ksign,
    ksignProof: ksignProof
  };
  return axios.post(url + '/auth', authMsg);
};

module.exports = {
  Auth,
  parseQRhex,
  resolv
};
