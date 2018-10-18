const axios = require('axios');
const utils = require('../utils');
const qrcode = require('qrcode-generator');

// const WebSocket = require('ws'); // for nodejs tests


function challenge() {
  let unixTime = Math.round((new Date()).getTime() / 1000);
  let r = Math.random();
  let randStr = r.toString(36).substr(7, 4);
  let challenge = 'uuid-' + unixTime + "-" + randStr;
  return challenge; // challenge of 20 characters length
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
   * @returns {String}
   */
  qr() {
    // generates the QR hex data challenge
    let b = new Buffer([]);
    b = Buffer.concat([b, Buffer.from(this.challenge)]);
    b = Buffer.concat([b, utils.hexToBytes(this.signature)]);
    b = Buffer.concat([b, Buffer.from(this.url)]);
    let r = utils.bytesToHex(b);
    return r;
  }
  printQr(qrHex, divId) {
    var typeNumber = 9;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(qrHex);
    qr.make();
    document.getElementById(divId).innerHTML = qr.createImgTag();
  }
}

var parseQRhex = function(h) {
  let b = utils.hexToBytes(h);
  let j = {
    challenge: b.slice(0,20).toString(), // 20 is the length of the challenge
    signature: utils.bytesToHex(b.slice(20, 85)),
    url: b.slice(85, b.length).toString()
  };
  return j;
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
  parseQRhex,
  resolv
};
