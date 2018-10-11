const axios = require('axios');
const utils = require('../utils');

const WebSocket = require('ws'); // for nodejs tests


function challenge() {
  let unixTime = Math.round((new Date()).getTime() / 1000);
  let randStr = Math.random().toString(36).substring(7);
  let challenge = 'uuid-' + unixTime + "-" + randStr;
  return challenge;
}
/**
 * @param  {Object} kc
 * @param  {String} ksign
 * @param  {String} url
 * @param  {String} wsurl
 */
class Auth {
  constructor(kc, ksign, url, wsurl, successCallback) {
    this.kc = kc;
    this.ksign = ksign;
    this.challenge = challenge();
    this.signed = kc.sign(ksign, this.challenge).signature;
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
   * @returns {String}
   */
  qr() {
    // generates the QR hex data challenge
    let dataJson = {
      ksign: this.ksign,
      challenge: this.challenge,
      signed: this.signed,
      type: "webauth",
      provider: "giveth",
      url: this.url
    };
    let qrData = utils.jsonToQr(dataJson);
    return qrData;
  }
}

var resolv = function (url, idaddr, challenge, signature, ksign, ksignProof) {
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
  resolv
};
