const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

describe('hashBytes()', function() {
  it('hashBytes()', function() {
    let b = Buffer.from('test');
    let hash = iden3.utils.hashBytes(b);
    let hexHash = iden3.utils.bytesToHex(hash);
    expect(hexHash).to.be.equal('0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658');
  });
  it('hash type', function() {
    let b = Buffer.from('authorizeksign');
    let hash = iden3.utils.hashBytes(b);
    let hexHash = iden3.utils.bytesToHex(hash);
    expect(hexHash).to.be.equal('0x353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a05ed7726d7932a1f');
  });
});

describe('bytesToHex()', function() {
  it('check bytesToHex()', function() {
    let b = Buffer.from('test');
    let hex = iden3.utils.bytesToHex(b);
    expect(hex).to.be.equal('0x74657374');
  });
});

describe('hexToBytes()', function() {
  it('check hexToBytes()', function() {
    let hex = '0x74657374';
    let b = iden3.utils.hexToBytes(hex);
    let expectedBytes = Buffer.from('test');
    expect(b.equals(expectedBytes)).to.be.equal(true);
  });
});
