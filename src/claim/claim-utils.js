// @flow
import { Entry } from './entry/entry';

import { Basic } from './basic/basic';
import { AuthorizeKSign } from './authorize-ksign/authorize-ksign';
import { SetRootKey } from './set-root-key/set-root-key';
import { AssignName } from './assign-name/assign-name';
import { AuthorizeKSignSecp256k1 } from './authorize-ksign-secp256k1/authorize-ksign-secp256k1';

const helpers = require('../sparse-merkle-tree/sparse-merkle-tree-utils');
const CONSTANTS = require('../constants');


/**
 * Decode entry class into claim data structure depending on its type
 * @param {Object} entry - Claim element structure
 * @returns {Object} Claim raw data
 */
function newClaimFromEntry(entry: Entry): void | Basic | AuthorizeKSign | SetRootKey | AssignName | AuthorizeKSignSecp256k1 {
  // Decode claim type from Entry class
  const claimType = helpers.bufferToBigInt(entry.elements[3].slice(24, 32)).value;
  // Parse elements and return the proper claim structure
  switch (claimType) {
    case CONSTANTS.CLAIMS.BASIC.TYPE:
      return Basic.newFromEntry(entry);
    case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN.TYPE:
      return AuthorizeKSign.newFromEntry(entry);
    case CONSTANTS.CLAIMS.SET_ROOT_KEY.TYPE:
      return SetRootKey.newFromEntry(entry);
    case CONSTANTS.CLAIMS.ASSIGN_NAME.TYPE:
      return AssignName.newFromEntry(entry);
    case CONSTANTS.CLAIMS.AUTHORIZE_KSIGN_SECP256K1.TYPE:
      return AuthorizeKSignSecp256k1.newFromEntry(entry);
    default:
      return undefined;
  }
}

module.exports = {
  newClaimFromEntry,
};
