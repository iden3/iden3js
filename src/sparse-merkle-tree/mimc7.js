const Web3 = require('web3');
const web3 = new Web3();
const snarkjs = require('snarkjs');

const { bn128 } = snarkjs;
const { bigInt } = snarkjs;

const F = bn128.Fr;

const SEED = 'mimc';
const NROUNDS = 91;

exports.getIV = (seed) => {
  if (typeof seed === 'undefined') seed = SEED;
  const c = web3.utils.keccak256(`${seed}_iv`);
  const cn = bigInt(web3.utils.toBN(c).toString());
  const iv = cn.mod(F.q);
  return iv;
};

exports.getConstants = (seed, nRounds) => {
  if (typeof seed === 'undefined') seed = SEED;
  if (typeof nRounds === 'undefined') nRounds = NROUNDS;
  const cts = new Array(nRounds);
  let c = web3.utils.keccak256(SEED);
  for (let i = 1; i < nRounds; i++) {
    c = web3.utils.keccak256(c);

    const n1 = web3.utils.toBN(c).mod(web3.utils.toBN(F.q.toString()));
    const c2 = web3.utils.padLeft(web3.utils.toHex(n1), 64);
    cts[i] = bigInt(web3.utils.toBN(c2).toString());
  }
  cts[0] = bigInt(0);
  return cts;
};

const cts = exports.getConstants(SEED, 91);

exports.hash = (_xIn, _k) => {
  const xIn = bigInt(_xIn);
  const k = bigInt(_k);
  let r;
  for (let i = 0; i < NROUNDS; i++) {
    const c = cts[i];
    const t = (i === 0) ? F.add(xIn, k) : F.add(F.add(r, k), c);
    r = F.exp(t, 7);
  }
  return F.affine(F.add(r, k));
};

exports.multiHash = (arr) => {
  let r = exports.getIV();
  for (let i = 0; i < arr.length; i++) {
    r = exports.hash(r, bigInt(arr[i]));
  }
  return r;
};
