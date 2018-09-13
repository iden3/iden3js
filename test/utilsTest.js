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

describe('verifySignature()', function() {
  it('check hexToBytes()', function() {
    let addressHex = '0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f';
    let msgHashHex = '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95';
    let signatureHex = '0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c';
    let verified = iden3.utils.verifySignature(msgHashHex, signatureHex, addressHex);
    expect(verified).to.be.equal(true);
  });
});
