const axios = require('axios');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const IPFS = require('ipfs');
const IPFSRoom = require('ipfs-pubsub-room');
// const encoder = new TextEncoder('utf-8');

/**
 * @param  {String} idaddr
 * @param  {String} roomQr
 * @param  {Param} roomConnectedCallback
 * @param  {Param} msgSendCallback
 */
class Dapp {
  constructor(idaddr, roomQr, roomConnectedCallback, msgSendCallback) {
    this.peerInfo = '';
    this.room = '';
    this.roomid = '';
    this.nonce = '';
    this.secretkey = '';
    this.ipfs = new IPFS({
      init: true,
      start: true,
      config: {
        Addresses: {
          Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'],
        },
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
    });

    this.ipfs.once('ready', () => this.ipfs.id((err, _peerInfo) => {
      if (err) {
        throw err;
      }
      this.peerInfo = _peerInfo;
      toastr.info(`IPFS node started and has ID ${this.peerInfo.id}`);

      const go = () => {
        this.ipfs.swarm.addrs().then((peers) => {
          if (peers.length === 0) {
            toastr.info('no peers connected. waiting...');
            setTimeout(() => go(), 1000);
          } else {
            toastr.info('connected to ipfs pubsub.');
            // this.parseQr(idaddr, roomQr, roomConnectedCallback, msgSendCallback);
          }
        });
      };
      go();
    }));
  }

  /**
   * @param  {String} idaddr
   * @param  {String} roomQr
   * @param  {Param} roomConnectedCallback
   * @param  {Param} msgSendCallback
   */
  parseQr(idaddr, roomQr, roomConnectedCallback, msgSendCallback) {
    this.secretkey = nacl.util.decodeBase64(roomQr);
    this.roomid = nacl.util.encodeBase64(nacl.hash(this.secretkey).slice(48));
    this.nonce = 0;

    this.room = IPFSRoom(this.ipfs, this.roomid);
    this.room.on('subscribed', () => {
      console.log(`Now connected to room ${this.roomid}`);
      roomConnectedCallback(this.roomid);
      this.room.on('message', message => this.recv(message, this.recv_wallet));
      this.send(`idaddr|${idaddr}`, msgSendCallback);
    });
  }

  /**
   * @param  {String} message
   * @param  {Param} msgSendCallback
   */
  send(message, msgSendCallback) {
    console.log('send', message);
    const nonceBytes = new Uint8Array(nacl.box.nonceLength);
    nonceBytes[nacl.box.nonceLength - 1] = this.nonce & 0xff;
    nonceBytes[nacl.box.nonceLength - 2] = (this.nonce >> 8) & 0xff;
    const ciphertext = nacl.secretbox(encoder.encode(message), nonceBytes, this.secretkey);
    this.room.broadcast(ciphertext);
    this.nonce += 1;
    msgSendCallback();
  }

  /**
   * @param  {String} message
   * @param  {Param} callback
   */
  recv(message, callback) {
    if (message.from === this.peerInfo.id) {
      return;
    }

    const nonceBytes = new Uint8Array(nacl.box.nonceLength);
    nonceBytes[nacl.box.nonceLength - 1] = this.nonce & 0xff;
    nonceBytes[nacl.box.nonceLength - 2] = (this.nonce >> 8) & 0xff;
    const plaintext = nacl.secretbox.open(message.data, nonceBytes, this.secretkey);
    if (plaintext === null) {
      status('Invalid message recieved', true);
      return;
    }
    this.nonce += 1;

    callback(decoder.decode(plaintext));
  }

  async recv_wallet(message) {
    status(`wallet got ${message}`, true);

    const [op, args] = message.split('|');
    if (op === 'call') {
      ksignaddr = '0xee602447b5a75cf4f25367f5d199b860844d10c4';
      ksignpvk = ethutil.toBuffer('0x8A85AAA2A8CE0D24F66D3EAA7F9F501F34992BACA0FF942A8EDF7ECE6B91F713');

      args = JSON.parse(args);

      // get last nonce for identity
      const idinfo = await axios.get(`${relayurl}/id/${idaddr}`);

      fwdnonce = 1 + idinfo.Onchain.LastNonce;

      // build signature
      const fwdsigpre = `0x${Buffer.concat([
        buf(uint8(0x19)),
        buf(uint8(0)),
        buf(idaddr),
        buf(uint256(fwdnonce)),
        buf(args.to),
        buf(args.data),
        buf(uint256(args.value)),
        buf(uint256(args.gas)),
      ]).toString('hex')}`;
      const fwdsig = ethutil.ecsign(buf(sha3(fwdsigpre)), ksignpvk);

      args.fwdsig = `0x${Buffer.concat([
        fwdsig.r,
        fwdsig.s,
        buf(fwdsig.v),
      ]).toString('hex')}`;

      // forward call
      const idifwdnoncenfo = await axios.post(`${relayurl}/id/${idaddr}/forward`, args);
    }
  }
}

module.exports = {
  Dapp,
};
