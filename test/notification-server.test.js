const chai = require('chai');

const { expect } = chai;
const iden3 = require('../index');

const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const nameServerUrl = 'http://127.0.0.1:7000/api/unstable';
const notificationUrl = 'http://127.0.0.1:10000/api/unstable';

describe('[notification-server] Notification server Http communications', () => {
  const testName = 'notification-server-test-user';
  let notificationServer;
  let id;
  let dataBase;
  let keyContainer;
  let relay;
  let proofClaimKeyOperational;
  let proofEthName;
  let nameServer;

  before('Create servers object', () => {
    dataBase = new iden3.Db.LocalStorage();
    keyContainer = new iden3.KeyContainer(dataBase);
    relay = new iden3.Relay(relayUrl);
    nameServer = new iden3.NameServer(nameServerUrl);
    notificationServer = new iden3.notifications.NotificationServer(notificationUrl);
    keyContainer.unlock('pass');
  });

  after('Lock keyContainer', () => {
    keyContainer.lock();
  });

  it('Generate keys for identity', () => {
    const mnemonic = 'clog brass lonely material arrest nominee flight try arrive water life cruise';
    keyContainer.setMasterSeed(mnemonic);
    const keys = keyContainer.createKeys();
    // Create identity object
    id = new iden3.Id(keys.kOp, keys.kRev, keys.kRec, relay, 0);
  });

  it('Load servers', () => {
    id.addNameServer(nameServer);
    expect(id.nameServer).to.be.not.equal(undefined);
    id.addNotificationServer(notificationServer);
    expect(id.nameServer).to.be.not.equal(undefined);
  });

  it('Setup manageNotifications in id', () => {
    const discovery = new iden3.discovery.Discovery(iden3.discovery.testEntitiesJSON);
    const nameResolver = new iden3.nameResolver.NameResolver(iden3.nameResolver.testNamesJSON);
    id.addDiscovery(discovery);
    id.addNameResolver(nameResolver);
    id.initSignedPacketVerifier();
    id.initManageNotifications();
  });

  it('Create identity, bind name and get proofClaim of operational key', async () => {
    // Create identity
    const createIdRes = await id.createId();
    expect(createIdRes.id).to.be.equal(id.id);
    expect(createIdRes.id).to.be.not.equal(undefined);
    expect(createIdRes.proofClaim).to.be.not.equal(undefined);
    proofClaimKeyOperational = createIdRes.proofClaim;
    // Bind label to identity address
    const bindIdRes = await id.bindId(keyContainer, id.keyOperationalPub, proofClaimKeyOperational, testName);
    proofEthName = bindIdRes.data;
  });

  it('Post notification', async () => {
    let i = 0;
    for (i = 0; i < 10; i++) {
      const msg = `dataTest-${i}`;
      // Create test notification for a given identity
      // eslint-disable-next-line no-await-in-loop
      const respPostNot = await id.sendNotification(keyContainer, id.keyOperationalPub,
        proofClaimKeyOperational, id.id, notificationUrl, iden3.notifications.newNotifTxt(msg));
      expect(respPostNot.status).to.be.equal(200);
    }
  });

  it('Login to notification server', async () => {
    // Login to notification server
    // It implies: request login packet, sign packet, submit signed packet and receive jws token
    const login = await id.loginNotificationServer(proofEthName, keyContainer, id.keyOperationalPub, proofClaimKeyOperational);
    expect(login.status).to.be.equal(200);
  });


  it('Retrieve notifications', async () => {
    // Get all 10 notifications
    const notifications = await id.getNotifications();
    expect(notifications.length).to.be.equal(10);
    let i = 0;
    for (i = 0; i < notifications.length; i++) {
      const notificationElement = notifications[i];
      const idData = notificationElement.id - 1;
      const notificationPost = `dataTest-${idData}`;
      expect(notificationElement.data).to.be.equal(notificationPost);
    }
    // Get notifications before identity notification 5
    const notificationsBefore = await id.getNotifications(5, 0);
    expect(notificationsBefore.length).to.be.equal(4);
    for (i = 0; i < notificationsBefore.length; i++) {
      const notificationElement = notificationsBefore[i];
      const idData = notificationElement.id;
      expect(idData).to.be.below(5);
    }
    // Get notifications after identity notification 5
    const notificationsAfter = await id.getNotifications(0, 5);
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
      const respPostNot = await id.sendNotification(keyContainer, id.keyOperationalPub,
        proofClaimKeyOperational, id.id, notificationUrl, iden3.notifications.newNotifTxt(notification));
      expect(respPostNot.status).to.be.equal(200);
    }

    const notifications = await id.getNotifications();
    expect(notifications.length).to.be.equal(10);

    // Get notifications before id notification 15
    // returns 10 notifications before id 15
    const notificationsBefore = await id.getNotifications(15, 0);
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
    const notifications = await id.getNotifications();
    expect(notifications.length).to.be.equal(0);
  });
});
