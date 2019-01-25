const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();

/**
* Encode parameter to pass as contract argument
* @param {String} path - Path of the json file
* @returns {String} - bytecode
*/
const encodeParam = function encodeParam(dataType, data) {
  return web3.eth.abi.encodeParameter(dataType, data);
};

/**
* Converts an int to uint256
* @param {Number} value
* @returns {String} - uint256 hex string
*/
function numberToUint256(value) {
  const hex = value.toString(16);
  return `0x${'0'.repeat(64 - hex.length)}${hex}`;
}

/**
* Read the bytecode from the contract json file
* @param {String} path - Path of the json file
* @returns {String} - bytecode
*/
const readContractFile = function readContractFile(path) {
  const contentRaw = fs.readFileSync(path);
  const content = JSON.parse(contentRaw.toString());
  return content.bytecode;
};

/**
* Calculate counterfactual idAddr of the identity
* Deterministically computes the smart contract address given
* the account the will deploy the contract (factory contract)
* the salt as uint256 and the contract bytecode
* original from: https://github.com/miguelmota/solidity-create2-example
* @param {String} creatorAddr - Eth address of the creator
* @param {String} salt - Salt
* @param {String} byteCode - Full bytecode concatenated with the constructor parameters of the smart contract
* @returns {String} - idAddr, the computed eth address of the counterfactual contract
*/
const buildCreate2Address = function buildCreate2Address(creatorAddr, salt, byteCode) {
  return `0x${web3.utils.sha3(`0x${['ff', creatorAddr, numberToUint256(salt), web3.utils.sha3(byteCode)].map(x => x.replace(/0x/, '')).join('')}`).slice(-40)}`.toLowerCase();
};

/**
* Calculate counterfactual idAddr of the identity
* @param {String} kop - Operational key
* @param {String} krec - Recovery key
* @param {String} krev - Revokator key
* @param {String} relayAddr - Relay eth address
* @param {String} iden3implAddr - Eth address of deployed IDen3Impl contract
* @param {String} iden3deployerAddr - Eth address of deployed Deployer contract
* @param {String} bytecode - Bytecode of the IDen3DelegateProxy contract
* @returns {String} - idAddr, the computed eth address of the counterfactual contract
*/
const calculateIDAddress = function calculateIDAddress(kop, krec, krev, relayAddr, iden3implAddr, iden3deployerAddr, bytecode) {
  const bytecodefull = `${bytecode}${encodeParam('address', kop).slice(2)}${
                          encodeParam('address', relayAddr).slice(2)}${
                          encodeParam('address', krec).slice(2)}${
                          encodeParam('address', krev).slice(2)}${
                          encodeParam('address', iden3implAddr).slice(2)}`;
  const salt = 0;
  return buildCreate2Address(iden3deployerAddr, salt, bytecodefull);
};

module.exports = {
  encodeParam,
  readContractFile,
  buildCreate2Address,
  calculateIDAddress,
};
