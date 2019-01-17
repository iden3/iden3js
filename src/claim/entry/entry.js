const utils = require('../../utils');
const mimc7 = require('../../sparse-merkle-tree/mimc7');
const helpers = require('../../sparse-merkle-tree/sparse-merkle-tree-utils');

/**
 * Generic representation of claim elements
 * Claim element structure is as follows: |element 0|element 1|element 2|element 3|
 * Each element contains 253 useful bits enclosed on a 256 bits Buffer
 */
class Entry {
  /**
   * Initialize claim elements with empty buffer
   */
  constructor() {
    this._elements = [Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32), Buffer.alloc(32)];
  }

  /**
   * Retrieve elements structure
   * @returns {Array} - Elements structure
   */
  get elements() {
    return this._elements;
  }

  /**
   * Set elements structure
   * @param {Array} value - Elements structure
   */
  set elements(value) {
    this._elements = value;
  }

  /**
   * Hash index calculation using mimc7 hash
   * Hash index is calculated from: |element 1|element 0|
   * @returns {Buffer} Hash index of the claim element structure
   */
  hi() {
    const hashArray = [this._elements[2], this._elements[3]];
    const hashKey = mimc7.multiHash(helpers.getArrayBigIntFromBuffArray(hashArray));
    return helpers.bigIntToBuffer(hashKey);
  }

  /**
   * Hash value calculation using mimc7 hash
   * Hash value is calculated from: |element 3|element 2|
   * @returns {Buffer} Hash value of the claim element structure
   */
  hv() {
    const hashArray = [this._elements[0], this._elements[1]];
    const hashKey = mimc7.multiHash(helpers.getArrayBigIntFromBuffArray(hashArray));
    return helpers.bigIntToBuffer(hashKey);
  }

  /**
   * Concats all the elements of the claim and parse it into an hexadecimal string
   * @returns {String} Hexadecimal string representation of element claim structure
   */
  toHexadecimal() {
    return utils.bytesToHex(Buffer.concat(this._elements));
  }

  /**
   * String deserialization into entry element structure
   * @param {String} Hexadecimal string representation of element claim structure
   */
  fromHexadecimal(entryHex) {
    const entryBuff = utils.hexToBytes(entryHex);
    for (let i = 0; i < this._elements.length; i++) {
      this._elements[(this._elements.length - 1) - i] = entryBuff.slice(entryBuff.length - (32 * (i + 1)), entryBuff.length - 32 * i);
    }
  }
}

module.exports = Entry;
