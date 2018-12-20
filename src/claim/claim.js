const merkleTree = require('../merkle-tree/merkle-tree');
const utils = require('../utils/utils');
const GenericClaim = require('./generic/generic');
const AuthorizeKSignClaim = require('./authorize-ksign/authorize-ksign');

const claim = (function claimModule() {
  /**
   * @param  {Buffer} bytes
   *
   * @returns  {Object} claim
   */
  const parseGenericClaimBytes = function (b) {
    const c = new GenericClaim();
    c.claim = {
      baseIndex: {
        namespace: b.slice(0, 32),
        type: b.slice(32, 56),
        indexLength: utils.ethBytesToUint32(b.slice(56, 60)),
        version: utils.ethBytesToUint32(b.slice(60, 64)),
      },
      extraIndex: {
        data: b.slice(64, utils.ethBytesToUint32(b.slice(56, 60))),
      },
      data: b.slice(utils.ethBytesToUint32(b.slice(56, 60)), b.length),
    };
    return c;
  };

  /**
   * @param  {Buffer} b - bytes
   *
   * @returns {Object} claim
   */
  const parseAuthorizeKSignClaim = function (b) {
    const validFromBytes = b.slice(148, 156);
    const validFrom = utils.ethBytesToUint64(validFromBytes);
    const validUntilBytes = b.slice(156, 164);
    const validUntil = utils.ethBytesToUint64(validUntilBytes);
    const c = new AuthorizeKSignClaim();

    c.claim = {
      baseIndex: {
        namespace: b.slice(0, 32),
        type: b.slice(32, 56),
        indexLength: utils.ethBytesToUint32(b.slice(56, 60)),
        version: utils.ethBytesToUint32(b.slice(60, 64)),
      },
      extraIndex: {
        keyToAuthorize: utils.bytesToHex(b.slice(64, 84)),
      },
      application: b.slice(84, 116),
      applicationAuthz: b.slice(116, 148),
      validFrom,
      validUntil,
    };

    return c;
  };

  /**
   * @param  {Buffer} b
   *
   * @returns {Buffer}
   */
  const hiFromClaimBytes = function (b) {
    const indexLength = utils.ethBytesToUint32(b.slice(56, 60));
    return utils.hashBytes(b.slice(0, indexLength));
  };

  /**
   * @param  {Object} proofOfClaim
   * @param  {Number} numLevels
   *
   * @returns {Boolean}
   */
  const checkProofOfClaim = function (proofOfClaim, numLevels) {
    let ht = utils.bytesToHex(utils.hashBytes(utils.hexToBytes(proofOfClaim.ClaimProof.Leaf)));
    let hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.ClaimProof.Leaf)));
    const vClaimProof = merkleTree.checkProof(proofOfClaim.ClaimProof.Root, proofOfClaim.ClaimProof.Proof, hi, ht, numLevels);

    ht = utils.bytesToHex(utils.hashBytes(utils.hexToBytes(proofOfClaim.SetRootClaimProof.Leaf)));
    hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.SetRootClaimProof.Leaf)));

    const vSetRootClaimProof = merkleTree.checkProof(proofOfClaim.SetRootClaimProof.Root,
      proofOfClaim.SetRootClaimProof.Proof, hi, ht, numLevels);

    ht = utils.bytesToHex(merkleTree.emptyNodeValue);
    hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.ClaimNonRevocationProof.Leaf)));

    const vClaimNonRevocationProof = merkleTree.checkProof(proofOfClaim.ClaimNonRevocationProof.Root,
      proofOfClaim.ClaimNonRevocationProof.Proof, hi, ht, numLevels);

    hi = utils.bytesToHex(hiFromClaimBytes(utils.hexToBytes(proofOfClaim.SetRootClaimNonRevocationProof.Leaf)));

    const vSetRootClaimNonRevocationProof = merkleTree.checkProof(proofOfClaim.SetRootClaimNonRevocationProof.Root,
      proofOfClaim.SetRootClaimNonRevocationProof.Proof, hi, ht, numLevels);

    return !!(vClaimProof && vSetRootClaimProof && vClaimNonRevocationProof && vSetRootClaimNonRevocationProof);
  };

  return {
    checkProofOfClaim,
    hiFromClaimBytes,
    parseAuthorizeKSignClaim,
    parseGenericClaimBytes,
  };
}());

module.exports = claim;
