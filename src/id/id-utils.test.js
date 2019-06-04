const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;

describe('[id utils] calculateIdGenesis()', () => {
  it('check calculateIdGenesis()', () => {
    // const privKey = '0x4be5471a938bdf3606888472878baace4a6a64e14a153adf9a1333969e4e573c';
    // const privKeyBuff = iden3.utils.hexToBytes(privKey);
    // const pubKeyBuff = utilsBabyJub.privToPub(privKeyBuff, true);
    // console.log("pbstr", iden3.utils.bytesToHex(pubKeyBuff));

    // public keys
    const kopStr = '0x966764905ac3e864c4bad1641659eda209b551b4cd78b08073db328b270a7f11'; // getted from the last 5 lines
    const kdisStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
    const kreenStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

    // check that with same keys that in go-iden3 test, gives the same idAddr than in go-iden3
    const idAddr = iden3.idUtils.calculateIdGenesis(kopStr, kdisStr, kreenStr);
    expect(idAddr).to.be.equal('11B5vT7X3sQBrPX6F5tEXMb7yMGHQ3UwbHPTHaXLx'); // same result as in go-iden3
  });
});
