const chai = require('chai');
const iden3 = require('../index');

const {expect} = chai;

describe('[claim] genericClaim', () => {
  const claim = new iden3.claim.GenericClaim('iden3.io', 'default', 'c1');

  it('claim.baseIndex.indexLength', () => {
    expect(claim.claim.baseIndex.indexLength).to.be.equal(66); // as it's the 64 bytes from the baseIndex + 2 bytes from the extraIndex
  });

  it('claim.bytes().length', () => {
    expect(claim.bytes().length).to.be.equal(66);
  });

  it('namespace and type string', () => {
    expect(iden3.utils.bytesToHex(claim.claim.baseIndex.namespace)).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074');
    expect(iden3.utils.bytesToHex(claim.claim.baseIndex.type)).to.be.equal('0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0');
  });

  it('bytes()', () => {
    const b = iden3.utils.bytesToHex(claim.bytes());
    expect(b).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074cfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db000000042000000006331');
  });

  it('hi()', () => {
    const hi = iden3.utils.bytesToHex(claim.hi());
    expect(hi).to.be.equal('0x0fce11cbd33e15d137a3a1953cda71aa81898ee8b917c21615073b59cd4dca8c');
  });

  it('ht()', () => {
    const ht = iden3.utils.bytesToHex(claim.ht());
    expect(ht).to.be.equal('0x0fce11cbd33e15d137a3a1953cda71aa81898ee8b917c21615073b59cd4dca8c');
  });

  it('parseGenericClaimBytes()', () => {
    const claimParsed = iden3.claim.parseGenericClaimBytes(claim.bytes());
    const hex = iden3.utils.bytesToHex(claimParsed.bytes());
    expect(hex).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074cfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db000000042000000006331');
  });
});

describe('[claim] authorizeKSignClaim', () => {
  const claim = new iden3.claim.AuthorizeKSignClaim('0x101d2fa51f8259df207115af9eaa73f3f4e52e60', 'appToAuthName', 'authz', 1535208350, 1535208350);
  it('claim.baseIndex.indexLength', () => {
    expect(claim.claim.baseIndex.indexLength).to.be.equal(84);
  });

  it('claim.bytes().length', () => {
    expect(claim.bytes().length).to.be.equal(164);
  });

  it('bytes()', () => {
    const b = iden3.utils.bytesToHex(claim.bytes());
    expect(b).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000000101d2fa51f8259df207115af9eaa73f3f4e52e602077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e');
  });

  it('hi()', () => {
    const hi = iden3.utils.bytesToHex(claim.hi());
    expect(hi).to.be.equal('0xb98902d35fe0861daaeb78ada21e60e1d7c009b6e56d85127e892aeb4ed37ef2');
  });

  it('ht()', () => {
    const ht = iden3.utils.bytesToHex(claim.ht());
    expect(ht).to.be.equal('0x9a1d4978ced5adfd4c4de9ee1bb4f850e0db426855737a5ecf0749d150620422');
  });

  it('parseAuthorizeKSignClaim()', () => {
    const hex = iden3.utils.bytesToHex(claim.bytes());
    const claimParsed = iden3.claim.parseAuthorizeKSignClaim(claim.bytes());
    const hexParsed = iden3.utils.bytesToHex(claimParsed.bytes());
    expect(hexParsed).to.be.equal('0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000000101d2fa51f8259df207115af9eaa73f3f4e52e602077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e');
    expect(hexParsed).to.be.equal(hex);
  });
});

describe('[claim] proofOfClaim()', () => {
  it('proofOfClaim', () => {
    const proofOfClaimStr = `
    {
      "ClaimProof": {
        "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000000970e8128ab834e8eac17ab8e3812f010678cf7912077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e",
        "Proof": "0x00000000000000000000000000000000000000000000000000000000000000052d3cbe677b6e4048e0db5a3d550e5f1bb2252c099a990137ac644ddfff9553dde5d128f57df872a6ab1c768ab3da7fc08faa153d4ac40c33471d25be32b38132",
        "Root": "0xb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101"
      },
      "SetRootClaimProof": {
        "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000003bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101",
        "Proof": "0x000000000000000000000000000000000000000000000000000000000000000b7d2ff8e70da77ef7559614425aa33021eb88752f63a690911c031a1fae273f9393b3f57a79800ca02cd1ac3a555d9dbb7d5869251d51d34e01d7de4ab811e9753cb6d37abb4eae8eeea11cbae9a96a021e2d157340721884763fc2ac33313ecd",
        "Root": "0x33f1e9b3ed86317369938d5bb04ba23e5f5de65da07c3a9368ffe19121e7a6c6"
      },
      "ClaimNonRevocationProof": {
        "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c4969403074353f867ef725411de05e3d4b0a01c37cf7ad24bcc213141a0000005400000001970e8128ab834e8eac17ab8e3812f010678cf7912077bb3f0400dd62421c97220536fd6ed2be29228e8db1315e8c6d7525f4bdf4dad9966a2e7371f0a24b1929ed765c0e7a3f2b4665a76a19d58173308bb34062000000005b816b9e000000005b816b9e",
        "Proof": "0x0000000000000000000000000000000000000000000000000000000000000003df560419165ec6b3299f04ac93510999379987ff25b0799a738ad0d078c9b9d6f912e7e2fab90f745aab5874a5e4f7657921b271378ea05ee9b0f25d69f87a3c",
        "Root": "0xb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101"
      },
      "SetRootClaimNonRevocationProof": {
        "Leaf": "0x3cfc3a1edbf691316fec9b75970fbfb2b0e8d8edfc6ec7628db77c49694030749b9a76a0132a0814192c05c9321efc30c7286f6187f18fc60000005400000004bc8c480e68d0895f1e410f4e4ea6e2d6b160ca9fb98333b2c502fc156d0ee7779d77aa9063fcbc6ed41e5c3e8b9900f379523101",
        "Proof": "0x000000000000000000000000000000000000000000000000000000000000000b615fadf56023c4ef72c3d455f0e6b6f9ace467e751e9b8e350fe0401368faf4801d4499dba57c843cd6c64fb07975d506e27b5e68166493618405a4bbf2b256eaf677f70fad9050c9d8e77b727fe6d29187c054cd47cfb3fcc10b2a4cbf08f8c",
        "Root": "0x33f1e9b3ed86317369938d5bb04ba23e5f5de65da07c3a9368ffe19121e7a6c6"
      },
      "Date": 1539008518,
      "Signature": "0x19074094d44fc77bc020d6c51c2e3f71fb45ede33b05202553d785cfce7d702411b98a4d0980d35383dfbe1d5b9779ee3b8f6295c27969bcf45156cdf6382b6201"
    }
    `;
    const proofOfClaim = JSON.parse(proofOfClaimStr);
    const verified = iden3.claim.checkProofOfClaim(proofOfClaim, 140);
    expect(verified).to.be.equal(true);
  });
});
