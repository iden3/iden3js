// @flow

const crypto = require('crypto');
const { babyJub, eddsa } = require('circomlib');
const { bigInt } = require('snarkjs');
const utils = require('../utils');

export class Signature {
  r8: [bigInt, bigInt];
  s: bigInt;

  constructor(r8: [bigInt, bigInt], s: bigInt) {
    this.r8 = r8;
    this.s = s;
  }

  static newFromCompressed(buf: Buffer): Signature {
    if (buf.length !== 64) {
      throw new Error('buf must be 64 bytes');
    }
    const sig = eddsa.unpackSignature(buf);
    if (sig.R8 == null) {
      throw new Error('unpackSignature failed');
    }
    return new Signature(sig.R8, sig.S);
  }

  compress(): Buffer {
    return eddsa.packSignature({ R8: this.r8, S: this.s });
  }
}

export class PublicKey {
  p: [bigInt, bigInt];

  constructor(p: [bigInt, bigInt]) {
    this.p = p;
  }

  static newFromCompressed(buf: Buffer): PublicKey {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes');
    }
    const bufLE = utils.swapEndianness(buf);
    const p = babyJub.unpackPoint(bufLE);
    if (p == null) {
      throw new Error('unpackPoint failed');
    }
    return new PublicKey(p);
  }

  compress(): Buffer {
    return utils.swapEndianness(babyJub.packPoint(this.p));
  }

  verifyMimc7(msg: bigInt, sig: Signature): boolean {
    return eddsa.verifyMiMC(msg, { R8: sig.r8, S: sig.s }, this.p);
  }
}

export class PrivateKey {
  sk: Buffer;

  constructor(buf: Buffer) {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes');
    }
    this.sk = buf;
  }

  static newRandom(): PrivateKey {
    const buf = crypto.randomBytes(Math.floor(256 / 8));
    return new PrivateKey(buf);
  }

  public(): PublicKey {
    return new PublicKey(eddsa.prv2pub(this.sk));
  }

  signMimc7(msg: bigInt): Signature {
    const s = eddsa.signMiMC(this.sk, msg);
    return new Signature(s.R8, s.S);
  }
}
