const chai = require('chai');
const { expect } = chai;
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const web3 = new Web3();

const iden3 = require('../index');

const privKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';
const privK = iden3.utils.hexToBytes(privKHex);
const address = ethUtil.privateToAddress(privK);
const addressHex = iden3.utils.bytesToHex(address);
// const pubK = ethUtil.privateToPublic(privK);
// const pubKHex = iden3.utils.bytesToHex(pubK);

const iden3implAddr = '0x66D0c2F85F1B717168cbB508AfD1c46e07227130'; // address of deployed IDen3Impl contract
const iden3deployerAddr = '0xf02e236F9F6C08966DD63B9fB9C04764E01b0563'; // address of deployed Deployer contract
const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';


describe('[eth/counterfactual] buildCreate2Address', () => {
  it('create counterfactual address from contract', () => {
    // read bytecode from the contract file
    const bytecode = iden3.counterfactual.readContractFile('./src/eth/testbytecode.json');
    const salt = 0;

    const kop = addressHex;
    const krec = addressHex;
    const krev = addressHex;
    expect(addressHex).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');

    const bytecodefull = `${bytecode}${iden3.counterfactual.encodeParam('address', kop).slice(2)}${
      iden3.counterfactual.encodeParam('address', relayAddr).slice(2)}${
      iden3.counterfactual.encodeParam('address', krec).slice(2)}${
      iden3.counterfactual.encodeParam('address', krev).slice(2)}${
      iden3.counterfactual.encodeParam('address', iden3implAddr).slice(2)}`;

    // middle step check bytecodefull equal to go-iden3 implementation
    expect(web3.utils.sha3(bytecodefull)).to.be.equal('0xcd37d9e0add749ea7f03b9f99597ac17c6264f1c4800991fb15602c7802e0969');

    const computedAddr = iden3.counterfactual.buildCreate2Address(iden3deployerAddr, salt, bytecodefull);
    expect(computedAddr).to.be.equal('0x52dc5fa952194ad6c3268666fc4e64407a1d457a');
  });
});

describe('[eth/counterfactual] calculateIDAddress', () => {
  it('calculate idAddr using the counterfactual contract', () => {
    // read bytecode from the contract file
    const bytecode = iden3.counterfactual.readContractFile('./src/eth/testbytecode.json');

    const kop = addressHex;
    const krec = addressHex;
    const krev = addressHex;
    expect(addressHex).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');


    const computedAddr = iden3.counterfactual.calculateIDAddress(kop, krec, krev, relayAddr, iden3implAddr, iden3deployerAddr, bytecode);
    expect(computedAddr).to.be.equal('0x52dc5fa952194ad6c3268666fc4e64407a1d457a');
  });
});
