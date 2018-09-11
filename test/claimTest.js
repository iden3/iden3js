const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

describe('claimDefault', function() {
  let claim = new iden3.claim.ClaimDefault('iden3.io', 'default', 'c1');
  it('string()', function() {
    expect(iden3.utils.bytesToHex(claim.claim.baseIndex.namespace)).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074');
    expect(iden3.utils.bytesToHex(claim.claim.baseIndex.type)).to.be.equal('0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728');
  });
  it('bytes()', function() {
    let b = iden3.utils.bytesToHex(claim.bytes());
    expect(b).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074cfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728000000006331');

  });
  it('hi()', function() {
    let hi = iden3.utils.bytesToHex(claim.hi());
    expect(hi).to.be.equal('0x54f22c228c99b424f787ad0673782f44cf83d13cb13c74924b0746e120135e4b');
  });
  it('ht()', function() {
    let ht = iden3.utils.bytesToHex(claim.ht());
    expect(ht).to.be.equal('0x54f22c228c99b424f787ad0673782f44cf83d13cb13c74924b0746e120135e4b');
  });
  it('parseClaimDefaultBytes()', function() {
    let claimParsed = iden3.claim.parseClaimDefaultBytes(claim.bytes());
    let hex = iden3.utils.bytesToHex(claimParsed.bytes());
    expect(hex).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074cfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728000000006331');
  });

});

describe('authorizeKSignClaim', function() {
  let claim = new iden3.claim.AuthorizeKSignClaim('iden3.io', '0x101d2fa51f8259df207115af9eaa73f3f4e52e60', 'appToAuthName', 'authz', 1535208350, 1535208350);
  it('bytes()', function() {
    let b = iden3.utils.bytesToHex(claim.bytes());
    expect(b).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a05ed7726d7932a1f00000000101d2fa51f8259df207115af9eaa73f3f4e52e602077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e');
  });
  it('hi()', function() {
    let hi = iden3.utils.bytesToHex(claim.hi());
    expect(hi).to.be.equal('0xf94b1fbc765c2925f59fc266861d7e585eda11f804340769b62b41e1d7df9e89');
  });
  it('ht()', function() {
    let ht = iden3.utils.bytesToHex(claim.ht());
    expect(ht).to.be.equal('0x8282b432d409ef113ad443bb8ec95e5accdeb63bba0bcd10d1bc9d1155952fe0');
  });
  it('parseAuthorizeKSignClaim()', function() {
    let hex = iden3.utils.bytesToHex(claim.bytes());
    let claimParsed = iden3.claim.parseAuthorizeKSignClaim(claim.bytes());
    let hexParsed = iden3.utils.bytesToHex(claimParsed.bytes());
    expect(hexParsed).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a05ed7726d7932a1f00000000101d2fa51f8259df207115af9eaa73f3f4e52e602077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e');
    expect(hexParsed).to.be.equal(hex);
  });
});
