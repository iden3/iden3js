const { bigInt, bn128 } = require('snarkjs');

const F = bn128.Fr;
// const Poseidon = require('../../node_modules/circomlib/src/poseidon.js');
const { poseidon } = require('circomlib');

function hash(arr) {
  const poseidonHash = poseidon.createHash(6, 8, 57);
  return poseidonHash(arr);
}

function multiHash(arr) {
  // TODO check bigints inside finite field

  let r = bigInt(0);
  for (let i = 0; i < arr.length; i += 5) {
    const fiveElems = [];
    for (let j = 0; j < 5; j++) {
      if (i + j < arr.length) {
        fiveElems.push(arr[i + j]);
      } else {
        fiveElems.push(bigInt(0));
      }
    }
    const ph = hash(fiveElems);
    r = F.add(r, ph);
  }
  return F.affine(r);
}

function hashBuffer(msgBuff) {
  const n = 31;
  const msgArray = [];
  const fullParts = Math.floor(msgBuff.length / n);
  for (let i = 0; i < fullParts; i++) {
    const v = bigInt.leBuff2int(msgBuff.slice(n * i, n * (i + 1)));
    msgArray.push(v);
  }
  if (msgBuff.length % n !== 0) {
    const v = bigInt.leBuff2int(msgBuff.slice(fullParts * n));
    msgArray.push(v);
  }
  return multiHash(msgArray);
}

module.exports = {
  hash,
  multiHash,
  hashBuffer,
};
