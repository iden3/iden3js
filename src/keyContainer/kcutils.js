const ethUtil = require('ethereumjs-util');
var pbkdf2 = require('pbkdf2-sha256')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')

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

/**
 * @param  {String} key
 * @param  {String} salt
 * @returns {String} - Key encoded in base64
 */
function passToKey(key, salt) {
  var res = pbkdf2(key, salt, 256, 32);
  return nacl.util.encodeBase64(res);
}

/**
 * @param  {String} key - Key encoded in base64
 * @param  {String} msg
 * @returns {String} - Encrypted msg in base64 encoding
 */
function encrypt(key, msg) {
  const newNonce = () => nacl.randomBytes(nacl.secretbox.nonceLength);

  const keyUint8Array = nacl.util.decodeBase64(key);

  const nonce = newNonce();
  // const messageUint8 = decodeUTF8(JSON.stringify(json));
  const messageUint8 = nacl.util.decodeUTF8(msg);
  const box = nacl.secretbox(messageUint8, nonce, keyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  const base64FullMessage = nacl.util.encodeBase64(fullMessage);
  return base64FullMessage;
}

/**
 * @param  {String} key - Key encoded in base64
 * @param  {String} messageWithNonce
 */
function decrypt(key, messageWithNonce) {
  const keyUint8Array = nacl.util.decodeBase64(key);
  const messageWithNonceAsUint8Array = nacl.util.decodeBase64(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(nacl.secretbox.nonceLength, messageWithNonce.length);

  const decrypted = nacl.secretbox.open(message, nonce, keyUint8Array);

  if (!decrypted) {
    throw new Error("Could not decrypt message");
  }

  const base64DecryptedMessage = nacl.util.encodeUTF8(decrypted);
  return base64DecryptedMessage;
}

module.exports = {
  concatSignature,
  passToKey,
  encrypt,
  decrypt
};
