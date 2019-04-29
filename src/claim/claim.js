// @flow
import { Entry } from './entry/entry';
import { Basic } from './basic/basic';
import { AuthorizeKSign } from './authorize-ksign/authorize-ksign';
import { SetRootKey } from './set-root-key/set-root-key';
import { AssignName } from './assign-name/assign-name';
import { AuthorizeKSignSecp256k1 } from './authorize-ksign-secp256k1/authorize-ksign-secp256k1';
import { LinkObjectIdentity } from './link-object-identity/link-object-identity';

const CONSTANTS = require('../constants');
const TYPE_OBJECT = require('./link-object-identity/object-types.js');
const utils = require('./claim-utils');
const i3utils = require('../utils');

/**
 * Decode entry class into claim data structure depending on its type
 * @param {Object} entry - Claim element structure
 * @returns {Object} Claim raw data
 */
// eslint-disable-next-line max-len
function newClaimFromEntry(entry: Entry): void | Basic | AuthorizeKSign | SetRootKey | AssignName | AuthorizeKSignSecp256k1 | LinkObjectIdentity {
  // Decode claim type from Entry class
  const claimType = i3utils.bufferToBigInt(entry.elements[3].slice(24, 32)).value;
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
    case CONSTANTS.CLAIMS.LINK_OBJECT_IDENTITY.TYPE:
      return LinkObjectIdentity.newFromEntry(entry);
    default:
      return undefined;
  }
}

module.exports = {
  Entry,
  Basic,
  AuthorizeKSign,
  SetRootKey,
  AssignName,
  AuthorizeKSignSecp256k1,
  LinkObjectIdentity,
  newClaimFromEntry,
  utils,
  TYPE_OBJECT,
};
