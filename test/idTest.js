const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
let testPrivK = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new ID()', function() {
  let kc = new iden3.KeyContainer(testPrivK);
  let id = new iden3.Id(kc);
  it('new ID without privK', function() {
    expect(id.kc).to.not.equal(undefined);
  });
});
