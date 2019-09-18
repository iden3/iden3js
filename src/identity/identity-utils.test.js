const chai = require('chai');
const iden3 = require('../index');
const eddsa = require('../crypto/eddsa-babyjub.js');

const { expect } = chai;

describe('[identity-utils] calculateIdGenesis()', () => {
  it('check calculateIdGenesis()', () => {
    const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const sk = new eddsa.PrivateKey(iden3.utils.hexToBytes(privKey));
    const pk = sk.public();

    const kopStr = pk.toString();
    // kopStr: 0xab05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c
    // public keys
    const kdisStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
    const kreenStr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
    const kupdateRoot = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

    // check that with same keys that in go-iden3 test, gives the same idAddr than in go-iden3
    const idAddr = iden3.identityUtils.calculateIdGenesis(kopStr, kdisStr, kreenStr, kupdateRoot);
    expect(idAddr.id).to.be.equal('11BFH4TUCsKLhGH6JdjP2kQMaJhgQdV18vGdTdj9be'); // same result as in go-iden3
  });
});
