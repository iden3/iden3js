const axios = require('axios');

/* eslint no-console: "off" */
export async function axiosGetDebug(url) {
  console.log(`### GET ${url}`);
  const res = await axios.get(url).then((_res) => {
    console.log('Returns:\n```js');
    console.log(JSON.stringify(_res.data, null, 2));
    console.log('```');
    return _res;
  }).catch((_err) => {
    console.log(`Error: ${_err}`);
  });
  return Promise.resolve(res);
}

export async function axiosPostDebug(url, data) {
  console.log(`### POST ${url}`);
  console.log('Input:\n```js');
  console.log(JSON.stringify(data, null, 2));
  console.log('```');
  const res = await axios.post(url, data).then((_res) => {
    console.log('Returns:\n```js');
    console.log(JSON.stringify(_res.data, null, 2));
    console.log('```');
    return _res;
  }).catch((_err) => {
    console.log(`Error: ${_err}`);
  });
  return Promise.resolve(res);
}
