const chai = require('chai');

const { expect } = chai;
const iden3 = require('../index');

const nameResolverUrl = 'http://127.0.0.1:8000/api/unstable';

const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/unstable';

describe('[name-resolver] Name resolver http communications', () => {
  let nameResolverService;
  let name;
  let id;
  let dataBase;
  let keyContainer;
  let relay;
  let proofClaimKeyOperational;

  before('Create name resolver object', () => {
    dataBase = new iden3.Db();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    relay = new iden3.Relay(relayUrl);
    nameResolverService = new iden3.NameResolver(nameResolverUrl);
  });

  it('Create identity and get proofClaim of operational key', async () => {
    keyContainer.unlock('pass');
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.generateMasterSeed(mnemonic);
    const keys = keyContainer.createKeys();
    const keyPublicOp = keys[1];
    const keyRecover = keys[2];
    const keyRevoke = keys[3];
    // Create identity object
    id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, relayAddr, '', undefined, 0);
    await id.createID()
      .then(async (createIDRes) => {
        // Successfull create identity api call to relay
        expect(createIDRes.idAddr).to.be.equal(id.idAddr);
        expect(createIDRes.idAddr).to.be.not.equal(undefined);
        expect(createIDRes.proofClaim).to.be.not.equal(undefined);
        proofClaimKeyOperational = createIDRes.proofClaim;
      });
    keyContainer.lock();
  });

  it('Bind identity to label', async () => {
    name = 'testName';
    await nameResolverService.bindID(keyContainer, name)
      .then((resp) => {
        expect(resp.status).to.be.equal(200);
      });
  });

  it('Resolve name', async () => {
    await nameResolverService.resolveName(`${name}@iden3.io`)
      .then((resp) => {
        expect(resp.status).to.be.equal(200);
        expect(resp.data.idAddr).to.be.equal(id.idAddr);
      });
  });
});
