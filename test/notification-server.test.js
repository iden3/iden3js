const chai = require('chai');

const { expect } = chai;
const iden3 = require('../index');

const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const nameServerUrl = 'http://127.0.0.1:7000/api/unstable';
const notificationUrl = 'http://127.0.0.1:10000/api/unstable';

describe('[notification-server] Notification server Http communications', () => {
  const testName = 'testName';
  let notificationServer;
  let id;
  let dataBase;
  let keyContainer;
  let relay;
  let proofClaimKeyOperational;
  let proofEthName;
  let nameServer;

  before('Create servers object', () => {
    dataBase = new iden3.Db();
    keyContainer = new iden3.KeyContainer('localStorage', dataBase);
    relay = new iden3.Relay(relayUrl);
    nameServer = new iden3.NameServer(nameServerUrl);
    notificationServer = new iden3.NotificationServer(notificationUrl);
  });

  it('Generate keys for identity', () => {
    keyContainer.unlock('pass');
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.generateMasterSeed(mnemonic);
    const keys = keyContainer.createKeys();
    const keyPublicOp = keys[1];
    const keyRecover = keys[2];
    const keyRevoke = keys[3];
    // Create identity object
    id = new iden3.Id(keyPublicOp, keyRecover, keyRevoke, relay, 0);
    keyContainer.lock();
  });

  it('Load servers', () => {
    id.addNameServer(nameServer);
    expect(id.nameServer).to.be.not.equal(undefined);
    id.addNotificationServer(notificationServer);
    expect(id.nameServer).to.be.not.equal(undefined);
  });

  it('Create identity, bind name and get proofClaim of operational key', async () => {
    keyContainer.unlock('pass');
    // Create identity
    const createIdRes = await id.createId();
    expect(createIdRes.idAddr).to.be.equal(id.idAddr);
    expect(createIdRes.idAddr).to.be.not.equal(undefined);
    expect(createIdRes.proofClaim).to.be.not.equal(undefined);
    proofClaimKeyOperational = createIdRes.proofClaim;
    // Bind label to identity address
    const bindIdRes = await id.bindId(keyContainer, id.keyOperationalPub, proofClaimKeyOperational, testName);
    proofEthName = bindIdRes.data;
    keyContainer.lock();
  });

  it('Post notification', async () => {
    let i = 0;
    for (i = 0; i < 10; i++) {
      const notification = `dataTest-${i}`;
      // Create test notification for a given identity
      // eslint-disable-next-line no-await-in-loop
      const respPostNot = await notificationServer.postNotification(id.idAddr, notification);
      expect(respPostNot.status).to.be.equal(200);
    }
  });

  it('Login to notification server', async () => {
    keyContainer.unlock('pass');
    // Login to notification server
    // It implies: request login packet, sign packet, submit signed packet and receive jws token
    const login = await id.loginNotificationServer(proofEthName, keyContainer, id.keyOperationalPub, proofClaimKeyOperational);
    expect(login.status).to.be.equal(200);
    keyContainer.lock();
  });


  it('Retrieve notifications', async () => {
    // Get all 10 notifications
    let resGetNot = await id.getNotifications();
    expect(resGetNot.status).to.be.equal(200);
    const { notifications } = resGetNot.data;
    expect(notifications.length).to.be.equal(10);
    let i = 0;
    for (i = 0; i < notifications.length; i++) {
      const notificationElement = notifications[i];
      const idData = notificationElement.id - 1;
      const notificationPost = `dataTest-${idData}`;
      expect(notificationElement.data).to.be.equal(notificationPost);
    }
    // Get notifications before identity notification 5
    resGetNot = await id.getNotifications(5, 0);
    expect(resGetNot.status).to.be.equal(200);
    const notificationsBefore = resGetNot.data.notifications;
    expect(notificationsBefore.length).to.be.equal(4);
    for (i = 0; i < notificationsBefore.length; i++) {
      const notificationElement = notificationsBefore[i];
      const idData = notificationElement.id;
      expect(idData).to.be.below(5);
    }
    // Get notifications after identity notification 5
    resGetNot = await id.getNotifications(0, 5);
    expect(resGetNot.status).to.be.equal(200);
    const notificationsAfter = resGetNot.data.notifications;
    expect(notificationsAfter.length).to.be.equal(5);
    for (i = 0; i < notificationsAfter.length; i++) {
      const notificationElement = notificationsAfter[i];
      const idData = notificationElement.id;
      expect(idData).to.be.above(5);
    }
  });

  it('Add 20 notifications in total', async () => {
    // Insert 10 more notifications
    let i = 0;
    for (i = 10; i < 20; i++) {
      const notification = `dataTest-${i}`;
      // Create test notification for a given identity
      // eslint-disable-next-line no-await-in-loop
      const respPostNot = await notificationServer.postNotification(id.idAddr, notification);
      expect(respPostNot.status).to.be.equal(200);
    }

    let resGetNot = await id.getNotifications();
    expect(resGetNot.status).to.be.equal(200);
    const { notifications } = resGetNot.data;
    expect(notifications.length).to.be.equal(10);

    // Get notifications before id notification 15
    // returns 10 notifications before id 15
    resGetNot = await id.getNotifications(15, 0);
    expect(resGetNot.status).to.be.equal(200);
    const notificationsBefore = resGetNot.data.notifications;
    expect(notificationsBefore.length).to.be.equal(10);
    for (i = 0; i < notificationsBefore.length; i++) {
      const notificationElement = notificationsBefore[i];
      const idData = notificationElement.id;
      expect(idData).to.be.below(15);
    }
  });

  it('Delete notifications', async () => {
    // Delete notifications
    const deleteResp = await id.deleteNotifications();
    expect(deleteResp.status).to.be.equal(200);
    expect(deleteResp.data.removed).to.be.equal(20);
    // Check pending notifications. Since they have been deleted, it should be 0
    const resGetNot = await id.getNotifications();
    expect(resGetNot.status).to.be.equal(200);
    const { notifications } = resGetNot.data;
    expect(notifications).to.be.equal(null);
  });
});
