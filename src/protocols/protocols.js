
const login = require('./login');
const proofs = require('./proofs');

module.exports = {
	login,
	verifyProofClaimFull: proofs.verifyProofClaimFull,
};

