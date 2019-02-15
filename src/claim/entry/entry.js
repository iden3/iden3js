// @flow
import { getArrayBigIntFromBuffArray, bigIntToBuffer } from '../../sparse-merkle-tree/sparse-merkle-tree-utils';

const utils = require('../../utils');
const mimc7 = require('../../sparse-merkle-tree/mimc7');

const entryElemsLen = 4;

/**
 * Generic representation of claim elements
 * Entry element structure is as follows: |element 0|element 1|element 2|element 3|
 * Each element contains 253 useful bits enclosed on a 256 bits Buffer
 */
export class Entry {
  elements: Array<Buffer>;

  constructor(e0: Buffer, e1: Buffer, e2: Buffer, e3: Buffer) {
    this.elements = [e0, e1, e2, e3];
  }

  /**
   * Initialize claim elements with empty buffer
   */
  static newEmpty(): Entry {
    return new Entry(Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32));
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
   * @returns {Buffer} Hash index of the claim element structure
   */
  hi(): Buffer {
    const hashArray = [this.elements[2], this.elements[3]];
    const hashKey = mimc7.multiHash(getArrayBigIntFromBuffArray(hashArray));
    return bigIntToBuffer(hashKey);
  }

  /**
   * Hash value calculation using mimc7 hash
   * Hash value is calculated from: |element 3|element 2|
   * @returns {Buffer} Hash value of the claim element structure
   */
  hv(): Buffer {
    const hashArray = [this.elements[0], this.elements[1]];
    const hashKey = mimc7.multiHash(getArrayBigIntFromBuffArray(hashArray));
    return bigIntToBuffer(hashKey);
  }

  /**
   * Concats all the elements of the entry and parse it into an hexadecimal string
   * @returns {String} Hexadecimal string representation of element claim structure
   */
  toHex(): string {
    return utils.bytesToHex(Buffer.concat(this.elements));
  }
}
