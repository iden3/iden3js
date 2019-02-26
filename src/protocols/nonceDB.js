// @flow

export type NonceObj = {
  nonce: string,
  timestamp: number,
  aux: any,
};

export type NonceResult = {
    nonceObj: NonceObj,
    index: number,
};

/**
* Class representing the NonceDB
*/
export class NonceDB {
  nonces: Array<NonceObj>;

  /**
  * Initialize NonceDB
  */
  constructor() {
    this.nonces = [];
  }

  /**
  * Add nonce with a specified timeout
  * The nonce will be valid until that timeout
  * @param {String} nonce
  * @param {Number} timeout - in unixtime format
  * @param {Object} auxData - Extra data to be added to NonceObject
  */
  _add(nonce: string, timeout: number, auxData: any = undefined): NonceObj {
    const nonceObj = {
      nonce,
      timestamp: timeout,
      aux: auxData,
    };
    this.nonces.push(nonceObj);
    return nonceObj;
  }

  /**
  * Add nonce with a specified delta
  * The nonce will be valid until current-time + delta
  * @param {String} nonce
  * @param {Number} delta, in seconds unit
  * @param {Object} auxData - Extra data to be added to NonceObject
  */
  add(nonce: string, delta: number, auxData: any = undefined): NonceObj {
    const date = new Date();
    const timestamp = Math.round((date).getTime() / 1000);
    const timeout = timestamp + delta;
    const nonceObj = this._add(nonce, timeout, auxData);
    return nonceObj;
  }

  /**
  * Add aux to the nonce
  * @param {String} nonce
  * @param {Object} aux
  * @param {bool}
  */
  addAuxToNonce(nonce: string, aux: any): boolean {
    for (let i = 0; i < this.nonces.length; i++) {
      if (this.nonces[i].nonce === nonce) {
        if (this.nonces[i].aux !== undefined) {
          // can not add an aux if already contains an aux
          return false;
        }
        this.nonces[i].aux = aux;
        return true;
      }
    }
    return false;
  }

  /**
  * Search nonce in NoceDB
  * @param {String} nonce
  * @returns {Object}
  */
  search(nonce: string): ?NonceResult {
    this.deleteOld();
    for (let i = 0; i < this.nonces.length; i++) {
      if (this.nonces[i].nonce === nonce) {
        return {
          nonceObj: this.nonces[i],
          index: i,
        };
      }
    }
    return undefined;
  }

  /**
  * Search nonce in NoceDB, and then delete it
  * @param {String} nonce
  * @returns {bool}
  */
  searchAndDelete(nonce: string): ?NonceResult {
    const n = this.search(nonce);
    if (n == null) {
      return undefined;
    }
    this.nonces.splice(n.index, 1);
    return n;
  }

  /**
  * Delete element in NonceDB
  * @param {String} nonce
  */
  deleteElem(nonce: string) {
    const n = this.search(nonce);
    if (n == null) {
      return;
    }
    this.nonces.splice(n.index, 1);
  }

  /**
  * Delete nonces with timestamp older than the given
  * @param {Number} timestamp - if not specified will get current time
  */
  deleteOld(timestamp: ?number) {
    if (timestamp == null) {
      const date = new Date();
      timestamp = Math.round((date).getTime() / 1000);
    }
    for (let i = 0; i < this.nonces.length; i++) {
      if (this.nonces[i].timestamp >= timestamp) {
        this.nonces.splice(0, i);
        break;
      }
    }
  }
}
