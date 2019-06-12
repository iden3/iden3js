// @flow
import { Entry } from './entry';

/**
* Increase `version` data field by 1
* @param {Entry} claim - Claim to increase its version value
*/
function incClaimVersion(claim: Entry) {
  const version = claim.elements[3].slice(20, 24).readUInt32BE(0);
  claim.elements[3].writeUInt32BE(version + 1, claim.elements[3].length - 64 / 8 - 32 / 8);
}

module.exports = {
  incClaimVersion,
};
