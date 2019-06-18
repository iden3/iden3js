const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;

describe('[identity-utils] calculateIdGenesis()', () => {
  it('check calculateIdGenesis()', () => {
    const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const privKeyBuff = iden3.utils.hexToBytes(privKey);
    const pubKeyBuff = iden3.crypto.utilsBabyJub.privToPub(privKeyBuff, true);
    // kopStr: 0xab05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c
    const kopStr = iden3.utils.bytesToHex(pubKeyBuff);
    // public keys
    const kdisStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
    const kreenStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

    // check that with same keys that in go-iden3 test, gives the same idAddr than in go-iden3
    const idAddr = iden3.identityUtils.calculateIdGenesis(kopStr, kdisStr, kreenStr);
    expect(idAddr.id).to.be.equal('118x3ctowfRqF9jqoBZzyjjBVbpXZr6zsYqQ5SdgzX'); // same result as in go-iden3
  });
});
