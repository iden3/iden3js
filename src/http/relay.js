const axios = require('axios');

var relayurl = 'http://127.0.0.1:5000'; // tmp

class Relay {
  constructor(url) {
    this.url = url;
  }
  /**
   * @returns {Object}
   */
  getRelayRoot() {
    return axios.get(relayurl + '/root')
  }

  /**
   * @param {String} - ID Address
   * @returns {Object}
   */
  getIDRoot(idaddr) {
    return axios.get(relayurl + '/claim/' + idaddr + '/root')
  }

  /**
   * @param  {String} - ID Address
   * @param {Object} claim
   * @returns {Object}
   */
  postClaim(idaddr, claim) {
    return axios.post(relayurl + '/claim/' + idaddr, claim);

  }

  /**
   * @param  {String} hi, Hash(index)
   * @returns {Object}
   */
  getClaimByHi(idaddr, hi) {
    return axios.get(relayurl + '/claim/' + idaddr + '/hi/' + hi);
  }
}

module.exports = Relay;