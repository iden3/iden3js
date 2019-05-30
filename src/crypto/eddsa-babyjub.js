// @flow

const crypto = require('crypto');
const { babyJub, eddsa } = require('circomlib');
const { bigInt } = require('snarkjs');

/* EdDSA Baby Jub signature */
export class Signature {
  r8: [bigInt, bigInt];
  s: bigInt;

  /* Create a Signature with the R8 point and S scalar */
  constructor(r8: [bigInt, bigInt], s: bigInt) {
    this.r8 = r8;
    this.s = s;
  }

  /* Create a Signature from a compressed Signature Buffer */
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

  /* Compress the Signature */
  compress(): Buffer {
    return eddsa.packSignature({ R8: this.r8, S: this.s });
  }

  /* Compress the Signature and return the hex encoding */
  toString(): string {
    return this.compress().toString('hex');
  }
}

/* EdDSA Baby Jub public key */
export class PublicKey {
  p: [bigInt, bigInt];

  /* Create a PublicKey from a curve point p */
  constructor(p: [bigInt, bigInt]) {
    this.p = p;
  }

  /* Create a PublicKey from a compressed PublicKey Buffer */
  static newFromCompressed(buf: Buffer): PublicKey {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes');
    }
    // const bufLE = utils.swapEndianness(buf);
    const p = babyJub.unpackPoint(buf);
    if (p == null) {
      throw new Error('unpackPoint failed');
    }
    return new PublicKey(p);
  }

  /* Compress the PublicKey */
  compress(): Buffer {
    // return utils.swapEndianness(babyJub.packPoint(this.p));
    return babyJub.packPoint(this.p);
  }

  /* Compress the PublicKey and return the hex encoding */
  toString(): string {
    return this.compress().toString('hex');
  }

  /* Verify the signature of a bigInt message using mimc7 hash */
  verifyMimc7(msg: bigInt, sig: Signature): boolean {
    return eddsa.verifyMiMC(msg, { R8: sig.r8, S: sig.s }, this.p);
  }
}

/* EdDSA Baby Jub private key */
export class PrivateKey {
  sk: Buffer;

  /* Create a PirvateKey from a 32 byte Buffer */
  constructor(buf: Buffer) {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes');
    }
    this.sk = buf;
  }

  /* Create a random PrivateKey */
  static newRandom(): PrivateKey {
    const buf = crypto.randomBytes(Math.floor(256 / 8));
    return new PrivateKey(buf);
  }

  /* Return the PrivateKey in hex encoding */
  toString(): string {
    return this.sk.toString('hex');
  }

  /* Get the PublicKey of the PrivateKey */
  public(): PublicKey {
    return new PublicKey(eddsa.prv2pub(this.sk));
  }

  /* Sign a bigInt message using mimc7 hash */
  signMimc7(msg: bigInt): Signature {
    const s = eddsa.signMiMC(this.sk, msg);
    return new Signature(s.R8, s.S);
  }
}
