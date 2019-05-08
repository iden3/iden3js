const chai = require('chai');
const iden3 = require('../index');

const { expect } = chai;

describe('[id utils] calculateIdGenesis()', () => {
  it('check calculateIdGenesis()', () => {
    // public keys
    const kopStr = '037e211781efef4687e78be4fb008768acca8101b6f1f7ea099599f02a8813f386';
    const krecStr = '03f9737be33b5829e3da80160464b2891277dae7d7c23609f9bb34bd4ede397bbf';
    const krevStr = '02d2da59d3022b4c1589e4910baa6cbaddd01f95ed198fdc3068d9dc1fb784a9a4';

    // check that with same keys that in go-iden3 test, gives the same idAddr than in go-iden3
    const idAddr = iden3.idUtils.calculateIdGenesis(kopStr, krecStr, krevStr);
    expect(idAddr.toUpperCase()).to.be.equal('0XA928CD71FF891600F5125E3436FAB6C8C7CB6CA1'.toUpperCase());
  });
});
