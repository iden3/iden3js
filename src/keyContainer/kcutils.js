const ethUtil = require('ethereumjs-util');

/**
 * @param  {Buffer} msg
 * @param  {Buffer} msgHash
 * @param  {Buffer} v
 * @param  {Buffer} r
 * @param  {Buffer} s
 * @returns {Object}
 */
function concatSignature(msg, msgHash, v, r, s) {
  var serialized = Buffer.from("");
  serialized = Buffer.concat([serialized, r]);
  serialized = Buffer.concat([serialized, s]);
  serialized = Buffer.concat([
    serialized,
    Buffer.from([v])
  ]);
  var signedMsg = {
    message: ethUtil.bufferToHex(msg),
    messageHash: ethUtil.bufferToHex(msgHash),
    v: ethUtil.bufferToHex(v),
    r: ethUtil.bufferToHex(r),
    s: ethUtil.bufferToHex(s),
    signature: ethUtil.bufferToHex(serialized)
  };
  return signedMsg;
}

module.exports = {
  concatSignature
};
