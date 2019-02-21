const ethUtil = require('ethereumjs-util');
const pbkdf2 = require('pbkdf2-sha256');
const nacl = require('tweetnacl');
const sealedBox = require('tweetnacl-sealedbox-js');
const utils = require('../utils');
nacl.util = require('tweetnacl-util');

/**
 * @param  {Buffer} msg
 * @param  {Buffer} msgHash
 * @param  {Buffer} v
 * @param  {Buffer} r
 * @param  {Buffer} s
 * @returns {Object}
 */
function concatSignature(msg, msgHash, v, r, s) {
  let serialized = Buffer.from('');

  serialized = Buffer.concat([serialized, r]);
  serialized = Buffer.concat([serialized, s]);
  serialized = Buffer.concat([
    serialized,
    Buffer.from([v]),
  ]);

  return {
    message: ethUtil.bufferToHex(msg),
    messageHash: ethUtil.bufferToHex(msgHash),
    v: ethUtil.bufferToHex(v),
    r: ethUtil.bufferToHex(r),
    s: ethUtil.bufferToHex(s),
    signature: ethUtil.bufferToHex(serialized),
  };
}

/**
 * @param  {String} key
 * @param  {String} salt
 * @returns {String} - Key encoded in base64
 */
function passToKey(key, salt) {
  const res = pbkdf2(key, salt, 256, 32);
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
  const messageUint8 = nacl.util.decodeUTF8(msg);
  const box = nacl.secretbox(messageUint8, nonce, keyUint8Array);
  const fullMessage = new Uint8Array(nonce.length + box.length);

  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  // base64 full message;
  return nacl.util.encodeBase64(fullMessage);
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
    throw new Error('Could not decrypt message');
  }
  // base64 decrypted message
  return nacl.util.encodeUTF8(decrypted);
}

/**
 * Function to encrypt data using public key
 * @param {String} pubKey - Public key in base64 string representation
 * @param {String} data - Data to be encrypted
 */
function encryptBox(pubKey, data) {
  const pubKeyBuff = utils.base64ToBytes(pubKey);
  const dataBuff = nacl.util.decodeUTF8(data);
  // Encrypt data
  const dataEncrypted = sealedBox.seal(dataBuff, pubKeyBuff);

  return utils.bytesToBase64(Buffer.from(dataEncrypted));
}

/**
 * Function to decrypt data using key pair: public key and private key
 * @param {String} privKey - Private key in base64 string representation
 * @param {String} pubKey - Public key in base64 string representation
 * @param {String} dataEncrypted - Data to be decrypted in base64 string representation
 */
function decryptBox(privKey, pubKey, dataEncrypted) {
  const pubKeyBuff = utils.base64ToBytes(pubKey);
  const privKeyBuff = utils.base64ToBytes(privKey);
  const dataEncryptedBuff = utils.base64ToBytes(dataEncrypted);
  // Decrypt data
  const data = sealedBox.open(dataEncryptedBuff, pubKeyBuff, privKeyBuff);

  return nacl.util.encodeUTF8(data);
}

module.exports = {
  concatSignature,
  passToKey,
  encrypt,
  decrypt,
  encryptBox,
  decryptBox,
};
