const utils = require('../utils');

function challenge() {
  let unixTime = Math.round((new Date()).getTime() / 1000);
  let randStr = Math.random().toString(36).substring(7)
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
  constructor(kc, ksign, url, wsurl) {
    this.url = url;
    this.wsurl = wsurl;
    this.kc = kc;
    this.ksign = ksign;
    this.challenge = challenge();
    this.signed = kc.sign(ksign, this.challenge).signature;
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

module.exports = Auth;
