const snarkjs = require('snarkjs');

const { bn128 } = snarkjs;
const { bigInt } = snarkjs;

const Web3 = require('web3');

const F = bn128.Fr;

const SEED = 'iden3_mimc';

function getConstants(seed, nRounds) {
  const cts = new Array(nRounds);
  let c = Web3.utils.keccak256(SEED);
  for (let i = 1; i < nRounds; i++) {
    c = Web3.utils.keccak256(c);

    const n1 = Web3.utils.toBN(c).mod(Web3.utils.toBN(F.q.toString()));
    cts[i] = Web3.utils.padLeft(Web3.utils.toHex(n1), 64);
  }
  cts[0] = '0x0000000000000000000000000000000000000000000000000000000000000000';
  return cts;
}

function MiMC7Hash(_xIn, _k, nRounds) {
  const xIn = bigInt(_xIn);
  const k = bigInt(_k);
  const cts = getConstants(SEED, nRounds);
  let r;
  for (let i = 0; i < nRounds; i++) {
    const c = bigInt(Web3.utils.toBN(cts[i]).toString());
    const t = (i === 0) ? F.add(xIn, k) : F.add(F.add(r, k), c);
    const t2 = F.square(t);
    const t4 = F.square(t2);
    r = F.mul(F.mul(t4, t2), t);
  }
  return F.affine(F.add(r, k));
}

function smtHash(arr) {
  let r = bigInt(0);
  for (let i = 0; i < arr.length; i++) {
    r = MiMC7Hash(r, bigInt(arr[i]), 91);
  }
  return r;
}

module.exports = {
  smtHash,
  getConstants,
};
