const { bigInt } = require('snarkjs');
const { mimc7 } = require('circomlib');

function hash(arr) {
  return mimc7.hash(arr[0], arr[1]);
};

function multiHash (arr) {
  // TODO check bigints inside finite field
  return mimc7.multiHash(arr);
};

function hashBuffer (msg) { // msg is a Buffer
  const n = 31;
  const msgArray = [];
  const fullParts = Math.floor(msg.length / n);
  for (let i = 0; i < fullParts; i++) {
    const v = bigInt.leBuff2int(msg.slice(n * i, n * (i + 1)));
    msgArray.push(v);
  }
  if (msg.length % n !== 0) {
    const v = bigInt.leBuff2int(msg.slice(fullParts * n));
    msgArray.push(v);
  }
  return mimc7.multiHash(msgArray);
}

module.exports = {
  hash,
  multiHash,
  hashBuffer,
}
