// @flow
import { describe, it, before } from 'mocha';
import { Entry } from './entry';

const chai = require('chai');
const ethUtil = require('ethereumjs-util');
const utils = require('../utils');
const claim = require('./claim');
const { utilsBabyJub } = require('../crypto/crypto');

const { secp256k1 } = ethUtil;
const { expect } = chai;

describe('[Claim Assign Name]', () => {
  const versionExample = 1;
  const nameExample = 'example.iden3.eth';
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  let claimAssignName;
  let entryClaim;
  let parsedClaim;

  before('Create new assign name claim', () => {
    claimAssignName = new claim.AssignName(nameExample, idExample);
    claimAssignName.version = versionExample;
    expect(claimAssignName).to.not.be.equal(null);
    entryClaim = claimAssignName.toEntry();
    parsedClaim = claim.AssignName.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAssignName.version).to.be.equal(parsedClaim.version);
  });
  it('Parse hash name', () => {
    expect(claimAssignName.hashName.toString('hex')).to.be.equal(parsedClaim.hashName.toString('hex'));
  });
  it('Parse id address', () => {
    expect(claimAssignName.id).to.be.equal(parsedClaim.id);
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '00d67b05d8e2d1ace8f3e84b8451dd2e9da151578c3c6be23e7af11add5a807a'
                                       + '0000000000000000000000000000000000000000000000010000000000000003');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x106d1a898d4503f4cb20be6ce9aeb2ac1e65d522579805e3633408a4b9ffcb53';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x25867e06233f276f39e298775245bad077eb0852b4eaac8dbf646a95bd3f8625';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });

  it('Parse entry into claim assign name', () => {
    const hashNameExample = utils.hashBytes(Buffer.from(nameExample, 'utf8')).slice(1, 32);
    const entryHex = entryClaim.toHex();

    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.id).to.be.equal(idExample);
    expect(c0.hashName.toString('hex')).to.be.equal(hashNameExample.toString('hex'));
  });
});

describe('[Claim Authorize Ethereum Key]', () => {
  let entryClaim;
  let parsedClaim;

  const ethKey = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';

  let claimAuthEthKey;

  before('Create new authorizeEthKey claim', () => {
    claimAuthEthKey = new claim.AuthorizeEthKey(ethKey, 2);
    expect(claimAuthEthKey).to.not.be.equal(null);
    entryClaim = claimAuthEthKey.toEntry();
    parsedClaim = claim.AuthorizeEthKey.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAuthEthKey.version).to.be.equal(parsedClaim.version);
  });
  it('Parse ethereum address', () => {
    expect(claimAuthEthKey.ethKey).to.be.equal(parsedClaim.ethKey);
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '000000000000000000000002e0fbce58cfaa72812103f003adce3f284fe5fc7c'
                                       + '0000000000000000000000000000000000000000000000000000000000000009');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x0718f79acd724288c56a0b7c7de9c61ad235245c64b9fb02e9de9e0a4d5d648b';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});

describe('[Claim Authorize KSign Babyjubjub]', () => {
  const versionExample = 1;
  const privKey = '0x28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKey);
  const pubKeyBuff = utilsBabyJub.privToPub(privKeyBuff, true);

  let claimAuthKSignBabyJub;
  let entryClaim;
  let parsedClaim;

  before('Create new authorizeKSign claim', () => {
    claimAuthKSignBabyJub = new claim.AuthorizeKSignBabyJub(utils.bytesToHex(pubKeyBuff));
    claimAuthKSignBabyJub.version = versionExample;
    expect(claimAuthKSignBabyJub).to.not.be.equal(null);
    entryClaim = claimAuthKSignBabyJub.toEntry();
    parsedClaim = claim.AuthorizeKSignBabyJub.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimAuthKSignBabyJub.version).to.be.equal(parsedClaim.version);
  });
  it('Parse sign', () => {
    expect(claimAuthKSignBabyJub.sign).to.be.equal(parsedClaim.sign);
  });
  it('Parse Ay', () => {
    expect(claimAuthKSignBabyJub.ay.toString('hex')).to.be.equal(parsedClaim.ay.toString('hex'));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '2b05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c'
                                       + '0000000000000000000000000000000000000001000000010000000000000001');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x04f41fdac3240e7b68905df19a2394e4a4f1fb7eaeb310e39e1bb0b225b7763f';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into claim authorize key sign babyjub', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.sign).to.be.equal(true);
    expect(c0.ay.toString('hex')).to.be.equal('2b05184c7195b259c95169348434f3a7228fbcfb187d3b07649f3791330cf05c');
  });
});

describe('[Claim Authorize KSignSecp256k1]', () => {
  let entryClaim;
  let parsedClaim;
  const versionExample = 1;
  const privKeyHex = '0x79156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
  const privKeyBuff = utils.hexToBytes(privKeyHex);
  const pubKeyCompressedExample = secp256k1.publicKeyCreate(privKeyBuff, true);
  let claimAuthKSignSecp256k1;

  before('Create new authorizeKSignSecp256k1 claim', () => {
    claimAuthKSignSecp256k1 = new claim.AuthorizeKSignSecp256k1(utils.bytesToHex(pubKeyCompressedExample));
    claimAuthKSignSecp256k1.version = versionExample;
    expect(claimAuthKSignSecp256k1).to.not.be.equal(null);
    entryClaim = claimAuthKSignSecp256k1.toEntry();
    parsedClaim = claim.AuthorizeKSignSecp256k1.newFromEntry(entryClaim);
  });

  it('Check public key compressed', () => {
    expect(utils.bytesToHex(pubKeyCompressedExample)).to.be.equal('0x036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
  });

  it('Parse version', () => {
    expect(claimAuthKSignSecp256k1.version).to.be.equal(parsedClaim.version);
  });
  it('Parse public key compressed', () => {
    expect(claimAuthKSignSecp256k1.pubKeyComp.toString('hex')).to.be.equal(parsedClaim.pubKeyComp.toString('hex'));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0000000000000000000000000000000000000000000000000000000000000000'
                                       + '00036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd'
                                       + '0000000000000000000000000000000000004d59000000010000000000000004');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x25aacb66cedd3be6248f68d61e8648ba163333070a4da17d35c424b798248440';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x06d4571fb9634e4bed32e265f91a373a852c476656c5c13b09bc133ac61bc5a6';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into claim authorize key sign secp256k1', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.pubKeyComp.toString('hex')).to.be.equal('036d94c84a7096c572b83d44df576e1ffb3573123f62099f8d4fa19de806bd4d59');
    expect(c0.version).to.be.equal(1);
  });
});

describe('[Claim Basic]', () => {
  const versionExample = 1;
  const indexExample = Buffer.alloc(50);
  indexExample.fill(41, 0, 1);
  indexExample.fill(42, 1, 49);
  indexExample.fill(43, 49, 50);
  const dataExample = Buffer.alloc(62);
  dataExample.fill(86, 0, 1);
  dataExample.fill(88, 1, 61);
  dataExample.fill(89, 61, 62);
  let claimBasic;
  let entryClaim;
  let parsedClaim;

  before('Create new basic claim', () => {
    claimBasic = new claim.Basic(indexExample, dataExample);
    claimBasic.version = versionExample;
    expect(claimBasic).to.not.be.equal(null);
    entryClaim = claimBasic.toEntry();
    parsedClaim = claim.Basic.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimBasic.version).to.be.equal(parsedClaim.version);
  });
  it('Parse index slot', () => {
    expect(utils.bytesToHex(claimBasic.index)).to.be.equal(utils.bytesToHex(parsedClaim.index));
  });
  it('Parse extra data slot', () => {
    expect(utils.bytesToHex(claimBasic.extraData)).to.be.equal(utils.bytesToHex(parsedClaim.extraData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0056585858585858585858585858585858585858585858585858585858585858'
                                       + '0058585858585858585858585858585858585858585858585858585858585859'
                                       + '00292a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
                                       + '002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2b000000010000000000000000');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x1d4d6c81f3cd8bd286affa0d5ac3b677d86fea34ba88d450081d703bcf712e6a';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x03c4686d099ffd137b83ba22b57dc954ac1e6c0e2b1e0ef972a936992b8788ff';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into basic claim', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(utils.bytesToHex(c0.index)).to.be.equal(utils.bytesToHex(indexExample));
    expect(utils.bytesToHex(c0.extraData)).to.be.equal(utils.bytesToHex(dataExample));
  });
});

describe('[Claim link object identity Id]', () => {
  const versionExample = 1;
  const objectTypeExample = 1;
  const objectIndexExample = 0;
  const hashObjectExample = utils.hexToBytes('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  const auxDataExample = utils.hexToBytes('0x0102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102');
  let claimLinkObject;
  let entryClaim;
  let parsedClaim;

  before('Create new unique id claim', () => {
    claimLinkObject = new claim.LinkObjectIdentity(
      objectTypeExample, objectIndexExample, idExample, hashObjectExample, auxDataExample,
    );
    claimLinkObject.version = versionExample;
    expect(claimLinkObject).to.not.be.equal(null);
    entryClaim = claimLinkObject.toEntry();
    parsedClaim = claim.LinkObjectIdentity.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimLinkObject.version).to.be.equal(parsedClaim.version);
  });
  it('Parse object type', () => {
    expect(claimLinkObject.objectType).to.be.equal(parsedClaim.objectType);
  });
  it('Parse object index', () => {
    expect(claimLinkObject.objectIndex).to.be.equal(parsedClaim.objectIndex);
  });
  it('Parse identity address', () => {
    expect(claimLinkObject.id).to.be.equal(parsedClaim.id);
  });
  it('Parse object hash identifier', () => {
    expect(utils.bytesToHex(claimLinkObject.objectHash)).to.be.equal(utils.bytesToHex(parsedClaim.objectHash));
  });
  it('Parse auxiliary data', () => {
    expect(utils.bytesToHex(claimLinkObject.auxData)).to.be.equal(utils.bytesToHex(parsedClaim.auxData));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x000102030405060708090a0b0c0d0e0f01020304050607090a0b0c0d0e0f0102'
                                       + '000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '0000000000000000000000000000000000000001000000010000000000000005');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x2dc73c37e603a15f8f028aa5c3f668d1210c86008577188ce279ead60a9afec4';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x0f55d2c10514bb5be610006cc9a1ff18aa4bb248856b41de516ee6d027b9463c';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
});

describe('[Claim Set root key]', () => {
  const versionExample = 1;
  const eraExample = 1;
  const idExample = '1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z';
  const rootKeyExample = utils.hexToBytes('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  let claimSetRootKey;
  let entryClaim;
  let parsedClaim;

  before('Create new set root claim', () => {
    claimSetRootKey = new claim.SetRootKey(idExample, rootKeyExample);
    claimSetRootKey.version = versionExample;
    claimSetRootKey.era = eraExample;
    expect(claimSetRootKey).to.not.be.equal(null);
    entryClaim = claimSetRootKey.toEntry();
    parsedClaim = claim.SetRootKey.newFromEntry(entryClaim);
  });

  it('Parse version', () => {
    expect(claimSetRootKey.version).to.be.equal(parsedClaim.version);
  });
  it('Parse era', () => {
    expect(claimSetRootKey.era).to.be.equal(parsedClaim.era);
  });
  it('Parse id address', () => {
    expect(claimSetRootKey.id).to.be.equal(parsedClaim.id);
  });
  it('Parse rootKey', () => {
    expect(utils.bytesToHex(claimSetRootKey.rootKey)).to.be.equal(utils.bytesToHex(parsedClaim.rootKey));
  });
  it('Extract bytes from full element', () => {
    const hexFromElement = entryClaim.toHex();
    expect(hexFromElement).to.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000'
                                       + '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c'
                                       + '0000041c980d8faa54be797337fa55dbe62a7675e0c83ce5383b78a04b26b9f4'
                                       + '0000000000000000000000000000000000000001000000010000000000000002');
  });
  it('Calculate Hi', () => {
    const hi = entryClaim.hi();
    const hiResult = '0x12bf59ff4171debe81321c04a52298e62650ca8514e9a7a8a64c23cb55eeaa2e';
    expect(utils.bytesToHex(hi)).to.be.equal(hiResult);
  });
  it('Calculate Hv', () => {
    const hv = entryClaim.hv();
    const hvResult = '0x01705b25f2cf7cda34d836f09e9b0dd1777bdc16752657cd9d1ae5f6286525ba';
    expect(utils.bytesToHex(hv)).to.be.equal(hvResult);
  });
  it('Parse entry into claim set root key', () => {
    const entryHex = entryClaim.toHex();
    const entry = Entry.newFromHex(entryHex);
    const c0 = (claim.newClaimFromEntry(entry): any);
    expect(c0.version).to.be.equal(1);
    expect(c0.era).to.be.equal(1);
    expect(c0.id).to.be.equal('1pnWU7Jdr4yLxp1azs1r1PpvfErxKGRQdcLBZuq3Z');
    expect(utils.bytesToHex(c0.rootKey)).to.be.equal('0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c');
  });
});
