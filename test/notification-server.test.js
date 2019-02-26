const chai = require('chai');

const { expect } = chai;
const iden3 = require('../index');

const relayAddr = '0xe0fbce58cfaa72812103f003adce3f284fe5fc7c';
const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const notificationUrl = 'http://127.0.0.1:6000/api/unstable';

describe('[notification-server] Notification server Http communications', () => {
  let notificationServer;
  let id;
  let dataBase;
  let keyContainer;
  let relay;
  let proofClaimKeyOperational;

  before('Create name resolver object', () => {
    dataBase = new iden3.Db();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    relay = new iden3.Relay(relayUrl);
    notificationServer = new iden3.NotificationServer(notificationUrl, true);
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

  it('Post notification', async () => {
    const notification = { issuer: id.idAddr, data: 'dataTest' };
    const notificationStrig = JSON.stringify(notification);
    // Create test notification for a given identity
    await notificationServer.postNotification(id.idAddr, notificationStrig)
      .then((resp) => {
        expect(resp.status).to.be.equal(200);
      });
  });

  it('Retrieve notifications', async () => {
    await notificationServer.getNotifications(keyContainer, id.idAddr, id.keyOperationalPub, proofClaimKeyOperational)
      .then((resp) => {
        expect(resp.status).to.be.equal(200);
        const notificationArray = resp.data;
        expect(notificationArray.length).to.be.equal(1);
        const notificationObject = notificationArray[0];
        expect(notificationObject.notification).to.be.equal('dataTest');
      });
  });

  it('Delete notifications', async () => {
    await notificationServer.deleteNotifications(keyContainer, id.idAddr, id.keyOperationalPub, proofClaimKeyOperational)
      .then(async (respDelete) => {
        expect(respDelete.status).to.be.equal(200);
        // Retrieve notiications ance thay have been deleted
        await notificationServer.getNotifications(keyContainer, id.idAddr, id.keyOperationalPub, proofClaimKeyOperational)
          .then((respGet) => {
            expect(respGet.status).to.be.equal(200);
            const notificationArray = respGet.data;
            expect(notificationArray.length).to.be.equal(1);
          });
      });
  });
});
