const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

let testPrivK = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new KeyContainer', function() {
  it('new KeyContainer without privK', function() {
    let kc = new iden3.KeyContainer();
    expect(kc.privateKey).to.not.equal(undefined);
  });
  it('new KeyContainer with privK', function() {
    let kc = new iden3.KeyContainer(testPrivK);
    expect(iden3.utils.bytesToHex(kc.privateKey)).to.be.equal('0xda7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8');
  });
});

describe('kc.sign()', function() {
  let kc = new iden3.KeyContainer(testPrivK);
  let signatureObj = kc.sign('test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('kc.address()', function() {
  let kc = new iden3.KeyContainer(testPrivK);
  it('address()', function() {
    let addressHex = iden3.utils.bytesToHex(kc.address());
    expect(addressHex).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('kc.addressHex()', function() {
  let kc = new iden3.KeyContainer(testPrivK);
  it('addressHex()', function() {
    let addressHex = kc.addressHex();
    expect(addressHex).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});
