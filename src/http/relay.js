const axios = require('axios');

var relayurl = 'http://127.0.0.1:5000'; // tmp

/**
 * @returns {Object}
 */
var getRelayRoot = () => {
  return axios.get(relayurl + '/root')
}

/**
 * @param {String} - ID Address
 * @returns {Object}
 */
var getIDRoot = (idaddr) => {
  return axios.get(relayurl + '/claim/' + idaddr + '/root')
}

/**
 * @param  {String} - ID Address
 * @param {Object} claim
 * @returns {Object}
 */
var postClaim = (idaddr, claim) => {
  return axios.post(relayurl + '/claim/' + idaddr, claim);

}

/**
 * @param  {String} hi, Hash(index)
 * @returns {Object}
 */
var getClaimByHi = (idaddr, hi) => {
  return axios.get(relayurl + '/claim/' + idaddr + '/hi/' + hi);
}

module.exports = {
  getRelayRoot,
  getIDRoot,
  postClaim,
  getClaimByHi
};
