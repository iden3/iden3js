
const NonceDB = require('./nonceDB');
const login = require('./login');
const proofs = require('./proofs');

module.exports = {
	NonceDB,
	login,
	verifyProofClaimFull: proofs.verifyProofClaimFull,
};

