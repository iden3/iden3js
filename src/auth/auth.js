// const axios = require('axios');
// const qrcode = require('qrcode-generator');
// const WebSocket = require('ws'); // for nodejs tests
// const utils = require('../utils');

// /**
//  * Generates the challenge with the current unixtime
//  * @returns {String}
//  */
// function challenge() {
//   const unixTime = Math.round((new Date()).getTime() / 1000);
//   const r = Math.random();
//   const randStr = r.toString(36).substr(7, 4);
//   return `uuid-${unixTime}-${randStr}`;
// }

// /**
//  * Creates the Auth class object, opens a websocket connection with the backend
//  * @param  {Object} kc - KeyContainer object
//  * @param  {String} ksign - KSign address
//  * @param  {String} url
//  * @param  {String} wsurl
//  * @param  {String} wsurl
//  * @param  {Param} successCallback
//  */
// class Auth {
//   constructor(kc, ksign, url, wsurl, successCallback) {
//     this.kc = kc;
//     this.ksign = ksign;
//     this.challenge = challenge();
//     this.signature = kc.sign(ksign, this.challenge).signature;
//     this.url = url;
//     this.wsurl = `${wsurl}/ws/${this.challenge}`;
//     this.successCallback = successCallback;
//     this.ws = new WebSocket(this.wsurl);
//     this.ws.onmessage = function (msg) {
//       const authData = JSON.parse(msg.data);
//       successCallback(authData);
//     };
//     this.ws.onopen = function () {
//       this.send(challenge);
//     };
//     this.send = function (data) {
//       this.ws.send(data);
//     };
//   }

//   /**
//    * Returns the QR hex data
//    * @returns {String}
//    */
//   qrHex() {
//     let b = Buffer.from([]);
//     b = Buffer.concat([
//       b,
//       Buffer.from(this.challenge),
//     ]);
//     b = Buffer.concat([
//       b,
//       utils.hexToBytes(this.signature),
//     ]);
//     b = Buffer.concat([
//       b,
//       Buffer.from(this.url),
//     ]);
//     return utils.bytesToHex(b);
//   }

//   /**
//    * Prints the QR hex data into a QR image in a given divId
//    * @param {String} - Div id where to place the QR image
//    */
//   printQr(divId) {
//     const qrHex = this.qrHex();
//     const typeNumber = 9;
//     const errorCorrectionLevel = 'L';
//     const qr = qrcode(typeNumber, errorCorrectionLevel);
//     qr.addData(qrHex);
//     qr.make();
//     document.getElementById(divId).innerHTML = qr.createImgTag();
//   }
// }

// /**
//  * Parses the QR Hex data into an object
//  * @param  {String} h - Hex string
//  * @returns {Object} - Object containing challenge, signature, url
//  */
// function parseQRhex(h) {
//   const b = utils.hexToBytes(h);
//   return {
//     challenge: b.slice(0, 20).toString(), // 20 is the length of the challenge
//     signature: utils.bytesToHex(b.slice(20, 85)),
//     url: b.slice(85, b.length).toString(),
//   };
// }

// /**
//  * @param  {String} url
//  * @param  {String} idAddr
//  * @param  {String} challengeStr
//  * @param  {String} signature
//  * @param  {String} kSign
//  * @param  {Object} kSignProof
//  * @returns
//  */
// function resolv(url, idAddr, challengeStr, signature, kSign, kSignProof) {
//   const authMsg = {
//     address: idAddr,
//     challenge: challengeStr,
//     signature,
//     ksign: kSign,
//     ksignProof: kSignProof,
//   };
//   return axios.post(`${url}/auth`, authMsg);
// }

// module.exports = {
//   Auth,
//   parseQRhex,
//   resolv,
// };
