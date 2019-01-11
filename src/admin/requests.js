const axios = require('axios');
const fs = require('fs');

const adminurl = "http://127.0.0.1:8001";


/**
 * Function called from the admin cli, to get the Relay Admin API info
 */
let info = function () {
    axios.get(`${adminurl}/info`).then(function(res) {
    	console.log(res.data);
    });
};

/**
 * Function called from the admin cli, to get the Relay Admin API rawdump
 * if filepath is not specified, prints the data
 * @param {String} filepath - file path to store the file with the raw dump data
 */
let rawdump = function(filepath) {
    axios.get(`${adminurl}/rawdump`).then((res) => {
	    console.log(res.data);
	    if(filepath) {
	    fs.writeFile(filepath, JSON.stringify(res.data), 'utf8', function(){});
	    } else {
	    	console.log(res.data);
	    }
    });
}

/**
 * Function called from the admin cli, to import the exported rawdump to the Relay Admin API
 * @param {String} filepath - file path from where to get the raw dump data to import
 */
let rawimport = function (filepath) {
	fs.readFile(filepath, 'utf8', function callback(err, data) {
		console.log("a", JSON.parse(data));
    		axios.post(`${adminurl}/rawimport`, JSON.parse(data)).then(function(res) {
    			console.log(res.data);
    		});
	});
};

/**
 * Function called from the admin cli, to get the Relay Admin API claimsdump
 */
let claimsdump = function () {
    axios.get(`${adminurl}/claimsdump`).then(function(res) {
    	console.log(res.data);
	return;
    });
};

/**
 * Function called from the admin cli, to get the Relay Admin API mimc7
 */
let mimc7 = function (elements) {
    axios.post(`${adminurl}/mimc7`, elements).then(function(res) {
    	console.log(res.data);
	return;
    });
};

/**
 * Function called from the admin cli, to post to the Relay Admin API addClaimBasic
 * Will add the claim directly to the Relay MerkleTree
 */
let addClaimBasic = function (indexData, data) {
	let d = {
		indexData: indexData,
		data: data
	};
    axios.post(`${adminurl}/claims/basic`, d).then(function(res) {
    	console.log(res.data);
	return;
    });
};

module.exports = {
	info,
	rawdump,
	rawimport,
	claimsdump,
	mimc7,
	addClaimBasic,
};
