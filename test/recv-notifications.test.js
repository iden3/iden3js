// This test requires a first step from go-iden3:
// github.com/iden3/go-iden3/services/notificationsrv TestInt

const chai = require('chai');

const { expect } = chai;
const iden3 = require('../index');

const relayUrl = 'http://127.0.0.1:8000/api/unstable';
const nameServerUrl = 'http://127.0.0.1:7000/api/unstable';
const notificationUrl = 'http://127.0.0.1:10000/api/unstable';

describe('[notification-server] Notification server Http communications', () => {
  const testName = 'recv-notifications-test-user';
  let notificationServer;
  let id;
  let dataBase;
  let keyContainer;
  let relay;
  let proofClaimKeyOperational;
  let proofEthName;
  let nameServer;

  before('Create servers object', () => {
    dataBase = new iden3.Db.LocalStorage('recvnottest');
    keyContainer = new iden3.KeyContainer(dataBase);
    relay = new iden3.Relay(relayUrl);
    nameServer = new iden3.NameServer(nameServerUrl);
    notificationServer = new iden3.notifications.NotificationServer(notificationUrl);
    console.log("Unlocking key container...");
    keyContainer.unlock('pass');
  });

  after('Lock keyContainer', () => {
    console.log("Locking key container...");
    keyContainer.lock();
  })

  it('Generate keys for identity', () => {
    // https://iancoleman.io/bip39/
    const mnemonic = 'emerge resource veteran where letter quantum budget elite bracket grab pioneer plunge';
    keyContainer.setMasterSeed(mnemonic);
    const keys = keyContainer.createKeys();
    // Create identity object
    // console.log('kOp', keys.kOp);
    id = new iden3.Id(keys.kOp, keys.kDis, keys.kReen, relay, 0);
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
    // console.log('id', id.id);
    expect(createIdRes.id).to.be.equal(id.id);
    expect(createIdRes.id).to.be.not.equal(undefined);
    expect(createIdRes.proofClaim).to.be.not.equal(undefined);
    proofClaimKeyOperational = createIdRes.proofClaim;
    // Bind label to identity address
    const bindIdRes = await id.bindId(keyContainer, id.keyOperationalPub, proofClaimKeyOperational, testName);
    proofEthName = bindIdRes.data;
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
    expect(notifications.length).to.be.equal(2);
    expect(notifications[0].type).to.be.equal(iden3.notifications.NOTIFTXTV01);
    expect(notifications[0].data).to.be.equal('notificationText');
    expect(notifications[1].type).to.be.equal(iden3.notifications.NOTIFCLAIMV01);
  });
});
