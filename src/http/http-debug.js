const axios = require('axios');
const util = require('util');

function printResponse(r) {
  console.log(`${r.status} ${r.statusText}`);
  console.log(`headers: ${util.inspect(r.headers)}`);
  console.log(util.inspect(r.data));
}

/* eslint no-console: "off" */
export function axiosGetDebug(url, config) {
  const h = () => { console.log(`### GET ${url}`); };
  return axios.get(url, config).then((res) => {
    h();
    console.log('Returns:\n```js');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('```');
    return res;
  }).catch((err) => {
    h();
    console.log('Input headers:\n', util.inspect(err.config.headers));
    console.log('Returns error:');
    printResponse(err.response);
    throw err;
  });
}

export function axiosPostDebug(url, data, config) {
  const h = () => {
    console.log(`### POST ${url}`);
    console.log('Input:\n```js');
    console.log(JSON.stringify(data, null, 2));
    console.log('```');
  };
  return axios.post(url, data, config).then((res) => {
    h();
    console.log('Returns:\n```js');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('```');
    return res;
  }).catch((err) => {
    h();
    console.log('Input headers:\n', util.inspect(err.config.headers));
    console.log('Returns error:');
    printResponse(err.response);
    throw err;
  });
}

export function axiosDeleteDebug(url, data, config) {
  const h = () => {
    console.log(`### DELETE ${url}`);
    console.log('Input:\n```js');
    console.log(JSON.stringify(data, null, 2));
    console.log('```');
  };
  return axios.delete(url, data, config).then((res) => {
    h();
    console.log('Returns:\n```js');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('```');
    return res;
  }).catch((err) => {
    h();
    console.log('Input headers:\n', util.inspect(err.config.headers));
    console.log('Returns error:');
    printResponse(err.response);
    throw err;
  });
}
