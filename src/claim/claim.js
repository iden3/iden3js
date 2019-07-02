// @flow
import { Entry } from './entry';
import { AssignName } from './claim-assign-name';
import { AuthorizeKSignSecp256k1 } from './claim-authorize-ksign-secp256k1';
import { AuthorizeKSignBabyJub } from './claim-authorize-ksign-babyjub';
import { LinkObjectIdentity, TYPE_OBJECT } from './claim-link-object-identity';
import { Basic } from './claim-basic';
import { SetRootKey } from './claim-set-root-key';
import { AuthorizeEthKey, ETH_KEY_TYPE } from './claim-authorize-eth-key';

const claimUtils = require('./claim-utils');

export {
  Entry,
  AssignName,
  AuthorizeKSignSecp256k1,
  AuthorizeKSignBabyJub,
  LinkObjectIdentity,
  TYPE_OBJECT,
  Basic,
  SetRootKey,
  AuthorizeEthKey,
  ETH_KEY_TYPE,
  claimUtils,
};

/**
 * Decode entry class into claim data structure depending on its type
 * @param {Object} entry - Claim element structure
 * @returns {Object} Claim raw data
 */
// eslint-disable-next-line max-len
export function newClaimFromEntry(entry: Entry): void | Basic | AuthorizeKSignBabyJub | SetRootKey | AssignName | AuthorizeKSignSecp256k1 | LinkObjectIdentity | AuthorizeEthKey {
  // Decode claim type from Entry class
  const { claimType } = claimUtils.getClaimTypeVersion(entry);
  // Parse elements and return the proper claim structure
  switch (claimType) {
    case claimUtils.CLAIMTYPES.BASIC.TYPE:
      return Basic.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.AUTHORIZE_KSIGN_BABYJUB.TYPE:
      return AuthorizeKSignBabyJub.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.SET_ROOT_KEY.TYPE:
      return SetRootKey.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.ASSIGN_NAME.TYPE:
      return AssignName.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.AUTHORIZE_KSIGN_SECP256K1.TYPE:
      return AuthorizeKSignSecp256k1.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.LINK_OBJECT_IDENTITY.TYPE:
      return LinkObjectIdentity.newFromEntry(entry);
    case claimUtils.CLAIMTYPES.AUTHORIZE_ETH_KEY.TYPE:
      return AuthorizeEthKey.newFromEntry(entry);
    default:
      throw new Error(`Unknown claim type ${claimType}`);
  }
}
