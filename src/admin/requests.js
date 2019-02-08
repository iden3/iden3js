const axios = require('axios');
const fs = require('fs');

const adminurl = 'http://127.0.0.1:8001';

/* eslint no-console: "off" */

/**
 * Function called from the admin cli, to get the Relay Admin API info
 */
function info() {
  axios.get(`${adminurl}/info`).then((res) => {
    console.log(res.data);
  });
}

/**
 * Function called from the admin cli, to get the Relay Admin API rawdump
 * if filepath is not specified, prints the data
 * @param {String} filepath - file path to store the file with the raw dump data
 */
function rawdump(filepath) {
  axios.get(`${adminurl}/rawdump`).then((res) => {
    console.log(res.data);
    if (filepath) {
      fs.writeFile(filepath, JSON.stringify(res.data), 'utf8', () => {});
    } else {
      console.log(res.data);
    }
  });
}

/**
 * Function called from the admin cli, to import the exported rawdump to the Relay Admin API
 * @param {String} filepath - file path from where to get the raw dump data to import
 */
function rawimport(filepath) {
  fs.readFile(filepath, 'utf8', (err, data) => {
    console.log('a', JSON.parse(data));
    axios.post(`${adminurl}/rawimport`, JSON.parse(data)).then((res) => {
      console.log(res.data);
    });
  });
}

/**
 * Function called from the admin cli, to get the Relay Admin API claimsdump
 */
function claimsdump() {
  axios.get(`${adminurl}/claimsdump`).then((res) => {
    console.log(res.data);
  });
}

/**
 * Function called from the admin cli, to get the Relay Admin API mimc7
 */
function mimc7(elements) {
  axios.post(`${adminurl}/mimc7`, elements).then((res) => {
    console.log(res.data);
  });
}

/**
 * Function called from the admin cli, to get the Relay Admin API addGenericClaim
 */
function addGenericClaim(indexData, data) {
  const d = { indexData, data };
  axios.post(`${adminurl}/genericClaim`, d).then((res) => {
    console.log(res.data);
  });
}

module.exports = {
  info,
  rawdump,
  rawimport,
  claimsdump,
  mimc7,
  addGenericClaim,
};
