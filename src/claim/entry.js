// @flow
import { getArrayBigIntFromBuffArrayBE, bigIntToBufferBE } from '../utils';

const { babyJub } = require('circomlib');
const snarkjs = require('snarkjs');
const utils = require('../utils');
const mimc7 = require('../sparse-merkle-tree/mimc7');

const { bigInt } = snarkjs;

const entryElemsLen = 4;

// TODO: Reorganize claim-utils to avoid cycle dependencies
/**
 * Check element in big endian must be less than claim element field
 * @param {Buffer} elem - elem in big endian
 * @throws {Error} throws an error when the check fails
 */
function checkElemFitsClaim(elem: Buffer) {
  if (elem.length !== 32) {
    throw new Error('Element is not 32 bytes length');
  }
  const elemBigInt = utils.bufferToBigIntBE(elem);
  if (elemBigInt.greater(babyJub.p)) {
    throw new Error('Element does not fit on claim element size');
  }
}

/**
 * Generic representation of claim elements
 * Entry element structure is as follows: |element 0|element 1|element 2|element 3|
 * Each element contains 253 useful bits enclosed on a 256 bits Buffer
 */
export class Entry {
  elements: Array<Buffer>;

  constructor(e0: Buffer, e1: Buffer, e2: Buffer, e3: Buffer) {
    checkElemFitsClaim(e0);
    checkElemFitsClaim(e1);
    checkElemFitsClaim(e2);
    checkElemFitsClaim(e3);
    this.elements = [e0, e1, e2, e3];
  }

  /**
   * Initialize claim elements with empty buffer
   */
  static newEmpty(): Entry {
    return new Entry(Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32));
  }

  /**
   * Initialize claim elements from big ints
   */
  static newFromBigInts(e0: bigInt, e1: bigInt, e2: bigInt, e3: bigInt): Entry {
    return new Entry(
      utils.bigIntToBufferBE(e0),
      utils.bigIntToBufferBE(e1),
      utils.bigIntToBufferBE(e2),
      utils.bigIntToBufferBE(e3),
    );
  }

  /**
   * String deserialization into entry element structure
   * @param {String} Hexadecimal string representation of element claim structure
   */
  static newFromHex(entryHex: string): Entry {
    const entryBuff = utils.hexToBytes(entryHex);
    const elements: any = [null, null, null, null];
    for (let i = 0; i < entryElemsLen; i++) {
      // Slice buffer into 32 bytes to insert it into an specific element
      elements[(entryElemsLen - 1) - i] = entryBuff.slice(entryBuff.length - (32 * (i + 1)), entryBuff.length - 32 * i);
    }
    return new Entry(elements[0], elements[1], elements[2], elements[3]);
  }

  /**
   * Hash index calculation using mimc7 hash
   * Hash index is calculated from: |element 1|element 0|
   * @returns {bigInt} Hash index of the claim element structure
   */
  hiBigInt(): bigInt {
    const hashArray = [this.elements[2], this.elements[3]];
    return mimc7.multiHash(getArrayBigIntFromBuffArrayBE(hashArray));
  }

  /**
   * Hash index calculation using mimc7 hash
   * Hash index is calculated from: |element 1|element 0|
   * @returns {Buffer} Hash index of the claim element structure
   */
  hi(): Buffer {
    return bigIntToBufferBE(this.hiBigInt());
  }

  /**
   * Hash value calculation using mimc7 hash
   * Hash value is calculated from: |element 3|element 2|
   * @returns {bigInt} Hash value of the claim element structure
   */
  hvBigInt(): bigInt {
    const hashArray = [this.elements[0], this.elements[1]];
    return mimc7.multiHash(getArrayBigIntFromBuffArrayBE(hashArray));
  }

  /**
   * Hash value calculation using mimc7 hash
   * Hash value is calculated from: |element 3|element 2|
   * @returns {Buffer} Hash value of the claim element structure
   */
  hv(): Buffer {
    return bigIntToBufferBE(this.hvBigInt());
  }

  /**
   * Concats all the elements of the entry and parse it into an hexadecimal string
   * @returns {String} Hexadecimal string representation of element claim structure
   */
  toHex(): string {
    return utils.bytesToHex(Buffer.concat(this.elements));
  }
}
