const helpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const CONSTANTS = require('../constants');
const assignNameClaim = require('./assign-name/assign-name');
const setRootKeyClaim = require('./set-root-key/set-root-key');
const authorizeKSignClaim = require('./authorize-ksign/authorize-ksign');
const authorizeKSignClaimSecp256k1 = require('./authorize-ksign-secp256k1/authorize-ksign-secp256k1');
const basicClaim = require('./basic/basic');

/**
 * Decode entry class into claim data structure depending on its type
 * @param {Object} entry - Claim element structure
 * @returns {Object} Claim raw data
 */
function newClaimFromEntry(entry) {
  // Decode claim type from Entry class
  const claimType = helpers.bufferToBigInt(entry.elements[3].slice(24, 32)).value;
  // Parse elements and return the proper claim structure
  switch (claimType) {
    case CONSTANTS.CLAIMS.BASIC.TYPE:
      return basicClaim.parseBasicClaim(entry);
    case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN.TYPE:
      return authorizeKSignClaim.parseAuthorizeKSign(entry);
    case CONSTANTS.CLAIMS.SET_ROOT_KEY.TYPE:
      return setRootKeyClaim.parseSetRootKey(entry);
    case CONSTANTS.CLAIMS.ASSIGN_NAME.TYPE:
      return assignNameClaim.parseAssignName(entry);
    case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.TYPE:
      return authorizeKSignClaimSecp256k1.parseAuthorizeKSignSecp256k1(entry);
    default:
      return undefined;
  }
}

module.exports = {
  newClaimFromEntry,
};
