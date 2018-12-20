const axios = require('axios');
const CONSTANTS = require('../constants');


/** ******* */
/* IDENTITY */
/** ******* */

/**
* @typedef {Object} KeyContainer
* @property {string} operational key
* @property {string} recoverer key
* @property {string} revokator key
*/
/**
 * Create an identity in the Relay. Will create a counterfactual address not deployed in the blockchain yet.
 *
 * As response we get something like:
 *
 *  {
 *      idaddr : '0x46b57a3f315f99a6de39406310f5bd0db03326c1'
 *  }
 *
 * @param {string} relayUrl - URL from the Relay
 * @param {KeyContainer} idKeys - Operational, recover and revoke keys
 *
 * @return {Promise} Promise object with the counterfactual identity address
 */
const createId = function createIdentity(relayUrl, idKeys) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && Object.keys(idKeys).length === 3;

  return rightArgs
    ? axios.post(`${relayUrl}/id`, idKeys)
    : Promise.reject(new Error('Create an identity:Some of the arguments have not been sent or have not valid type'));
};

/**
* Tell to the Relay to deploy in the 'blockchain' an identity.
*
* As response we get something like:
*
*   {
*       idaddr: '0x8435ebb41634c05019be1710be0007fa0d92861f',
*       tx: '0x403859ccc701eb358d3a25c908c33de733cbb2d0ebc1c7738eed4908cc8cf5c4'
*   }
*
* @param {string} relayUrl - URL from the Relay
* @param {string} idAddress - Ethereum address of the identity (in this case, it's deployed yer, is the counterfactual)
*
* @return {Promise} Promise object with the final identity address and transaction identifier
*/
const deployId = function deployIdentity(relayUrl, idAddress) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String;

  return rightArgs
    ? axios.post(`${relayUrl}/id/${idAddress}/deploy`)
    : Promise.reject(new Error('Deploy identity: Some of the arguments have not been sent or have not valid type'));
};

/**
* @typedef {Object} BindLabelData
* @property {string} ethId Ethereum address of the identity to bind the label
* @property {string} name Label to bind
* @property {string} signature Label and address signed with an operational key
* @property {string} ksign Key for sign (operational)
*/
/**
 * Bind label of an identity with its address in the Relay creating an 'AssignNameClaim' for binding an identity with a label.
 *
 * As response we get something like:
 *
 *  {
 *      ethID: '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f',
 *      name: 'username',
 *      signature: '0xeda8b278eae69cd8c4863380f0af5cfe8360481790d8ea5c188705b552bc0d5e1384efb627db5b423d4a163ad02ca23a2f05eea5dc787ac5837789aa95f50f101b'
 *  }
 *
 * @param {string} relayUrl - URL from the Relay
 * @param {BindLabelData} data - To send with the label, address and signed data
 *
 * @return {Promise} Promise object with the Ethereum address, the label linked and the signature of the action.
 */
const bindIdLabel = function bindIdentityAndLabel(relayUrl, data) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && Object.keys(data).length === 4;

  return rightArgs
    ? axios.post(`${relayUrl}/vinculateid`, data)
    : Promise.reject(new Error('Bind label with an identity: Some of the arguments have not been sent or have not valid type'))
};

/**
* Get from the Relay, the root of this identity Merkle tree.
*
* As response we get something like:
*
*  {
*     idRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
*     idRootProof: '0x0000000000000000000000000000000000000000000000000000000000000000',
*     root: '0x0000000000000000000000000000000000000000000000000000000000000000'
*  }
*
* @param {string} relayUrl - URL from the Relay
* @param {string} idAddress - Eth address from the identity to get the tree root
*
* @returns {Promise} with and object the root, the poof and address of the root
*/
const getIdRoot = function getIdentityRoot(relayUrl, idAddress) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String;

  return rightArgs
    ? axios.get(`${relayUrl}/claim/${idAddress}/root`)
    : Promise.reject(new Error('Get identity root: Some of the arguments have not been sent or have not valid type'));
};

/**
 * Retrieve the information of and identity from its tree in the Relay.
 *
 * As response we get something like:
 *
 *  {
 *      IDAddr: '0x46b57a3f315f99a6de39406310f5bd0db03326c1',
 *      LocalDb: {
 *          Operational: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
 *          Relayer: '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c',
 *          Recoverer: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
 *          Revokator: '0x970e8128ab834e8eac17ab8e3812f010678cf791',
 *          Impl: '0x2623ed1533d47d56f912300ae40f83b9370cead6'
 *      },
 *      Onchain: null
 *  }
 *
 * @param {string} relayUrl - URL from the Relay
 * @param {string} idAddress - Eth address from the identity to get the information
 *
 * @returns {Promise} with an object the identity information from the Relay, like if is onChain, address, addresses of the keys...
 */
const getIdInfo = function getIdentityInformation(relayUrl, idAddress) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String;

  return rightArgs
    ? axios.get(`${relayUrl}/id/${idAddress}`)
    : Promise.reject(new Error('Get identity information: Some of the arguments have not been sent or have not valid type'));
};

const getClaimByHi = function getClaimByHashIndex(relayUrl, idAddress, hashIndex) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String
                    && hashIndex
                    && hashIndex.constructor === String;

  return rightArgs
    ? axios.get(`${relayUrl}/claim/${idAddress}/hi/${hashIndex}`)
    : Promise.reject(new Error('Get claim by hi: Some of the arguments have not been sent or have not valid type'));
};

/**
 * Retrieve from the Relay the ethereum address from a given label of an identity.
 *
 * As response we get something like:
 *
 *  {
 *    claim: '0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8e...',
 *    ethID: '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f'
 *  }
 *
 * @param {string} relayUrl - URL from the Relay
 * @param {string} idLabel - Label of the identity
 *
 * @returns {Promise} with an object with the claim and the ethereum address of the identity
 */
const getIdAddress = function getIdentityAddress(relayUrl, idLabel) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idLabel
                    && idLabel.constructor === String;

  return rightArgs
    ? axios.get(`${relayUrl}/identities/resolv/${idLabel}`)
    : Promise.reject(new Error('Get identity address: Some of the argument have not been sent or have not valid type'));
};


/** **** */
/* RELAY */
/** **** */

/**
 * Retrieve the root of the relay's tnewClaimhe Relay.
 *
 * As response we get something like:newClaim
 *
 *  {
 *      contractRoot: '0x6e4659fedd8ff00b14e487d6d5f537646f07bde944d935d51bd9de807d6fc1c9',
 *      root: '0x0000000000000000000000000000000000000000000000000000000000000000'
 *  }
 *
 * @param {string} relayUrl - URL of the Relay
 *
 * @return {Promise} Promise object with the contract root and relay's root
 */
const getRelayRoot = function getRelayRootInformation(relayUrl) {
  const rightArgs = relayUrl && relayUrl.constructor === String;

  return rightArgs
    ? axios.get(`${relayUrl}/root`)
    : Promise.reject(new Error('Get identity information: Not relay URL provided or it is not a string'));
};

/**
 * Signed message full object.
 * @typedef {Object} SignedMessage
 * @property {string} valueHex - hex value of the claim
 * @property {string} signatureHex - Hex signature of the claim
 * @property {string} ksign - Signature key
 */
/**
 *
 * @param {string} relayUrl - URL of the Relay
 * @param {string} idAddress - Hex od the identity address
 * @param {SignedMessage} signedMsg - Object with the values of the claim to post
 */
const postClaim = function postClaimToRelay(relayUrl, idAddress, signedMsg) {
  const rightArgs = relayUrl
                    && relayUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String
                    && signedMsg
                    && Object.keys(signedMsg).length === 3;

  return rightArgs
    ? axios.post(`${relayUrl}/claim/${idAddress}`, signedMsg)
    : Promise.reject(new Error('Post claim to Relay: Some of the arguments have not been sent or have not valid type'));
};


/** ************* */
/* PRIVATE FOLDER */
/** ************* */

/**
 * Get the proof of work difficulty from the backup server.
 *
 * @param {string} serverUrl - The url of the backup server
 * @param {Object} data - Extra data (use to be an empty object {})
 *
 * @return {Promise} Promise object with the proof of work difficulty
 */
const getPoWDifficulty = function getPoWDifficultyFromBackupServer(serverUrl, data) {
  const rightArgs = serverUrl && serverUrl.constructor === String;

  return rightArgs
    ? axios.get(`${serverUrl}/`, data)
    : Promise.reject(new Error('Get proof of word difficulty: Not server URL provided or it is not a string'));
};

/**
 * Save to the backup server the data from the identity private folder.
 *
 * @param {string} serverUrl - URL of the backup server
 * @param {string} idAddress - Identity address of the private folder owner
 * @param {Object} dataToSave - Encrypted private folder data to do the backup
 *
 * @return {Promise} Promise object with the new  version of the data and other information
 */
const backupPrivateFolder = function backupPrivateFolderData(serverUrl, idAddress, dataToSave) {
  const rightArgs = serverUrl
                    && serverUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String
                    && dataToSave
                    && Object.keys(dataToSave).length === 0;

  return rightArgs
    ? axios.post(`${serverUrl}/${idAddress}/save`, dataToSave)
    : Promise.reject(new Error('Backup data: Some of the arguments have not been sent or have not valid type'));
};

/**
 *
 * @param {string} serverUrl - Backup server URL
 * @param {string} idAddress - Hex identity address
 * @param {string} by - 'version' or 'type'
 * @param {string} selector - Information to query, i.e. the version number
 *
 * @return {Promise} Promise object with the new  version of the data and other information
 */
const recoverPrivateFolder = function recoverPrivateFolderData(serverUrl, idAddress, by, selector) {
  const rightArgs = serverUrl
                    && serverUrl.constructor === String
                    && idAddress
                    && idAddress.constructor === String;

  if (!rightArgs) {
    return Promise.reject(new Error('Recover private folder: Some of the arguments have not been sent or have not valid type'));
  }

  switch (by) {
    case CONSTANTS.PRIVATE_FOLDER.SELECTORS.VERSION:
      return axios.post(`${serverUrl}/${idAddress}/recover/version/${selector}`, {});
    case CONSTANTS.PRIVATE_FOLDER.SELECTORS.TYPE:
      return axios.post(`${serverUrl}/${idAddress}/recover/type/${selector}`, {});
    default:
      return axios.post(`${serverUrl}/${idAddress}/recover`, {});
  }
};

module.exports = {
  bindIdLabel,
  createId,
  deployId,
  getIdRoot,
  getIdInfo,
  getIdAddress,
  getRelayRoot,
  postClaim,
  getClaimByHi,
  getPoWDifficulty,
  backupPrivateFolder,
  recoverPrivateFolder,
};
