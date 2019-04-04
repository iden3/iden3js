// @flow

const sign = require('../protocols/login');

export type Notification = {
  id: number,
  date: number,
  jws: string,
  toAddr: string,
};

export type NotificationFull = {
  id: number,
  dateServer: number,
  issuer: string,
  dateIssuer: number,
  type: string,
  data: Object,
}

const TYPE_NOTIFICATIONS = {
  PROOFCLAIM: 'notif.claim.v01',
  TEXT: 'notif.txt.v01',
};

/**
 * Class to manage notifications
 * Manage all possible actions related to notifications
 */
export class ManagerNotifications {
  lastIdNotification: number;
  verifier: sign.SignedPacketVerifier;

  /**
   * Notification are downloaded and they must be verified first in order to process them afterwards
   * @param {SignedPacketVerifier} verifyService - Represents all the functions needed to verify packets
   */
  constructor(verifyService: sign.SignedPacketVerifier) {
    this.lastIdNotification = 0;
    this.verifier = verifyService;
  }

  manage(not: NotificationFull): boolean {
    const typeNot = not.type;
    switch (typeNot) {
      case TYPE_NOTIFICATIONS.PROOFCLAIM:
        return true;
      case TYPE_NOTIFICATIONS.TEXT:
        return true;
      default: return true;
    }
  }

  /**
   * Verify signed packet and retrieve useful notification information
   * @param {Notification} not - Notification object
   */
  checkNot(not: Notification): ?NotificationFull {
    const result = this.verifier.verifySignedPacketMessage(not.jws);
    if (result == null) {
      return undefined;
    }
    const { header, payload } = result;
    const notFull = {
      id: not.id,
      dateServer: not.date,
      issuer: header.iss,
      dateIssuer: header.iat,
      type: payload.form.type,
      data: payload.form.data,
    };
    this.manage(notFull);
    return notFull;
  }

  /**
   * Update the last notification identifier
   * Used to only retrieve notifications after the last one
   * @param {Number} notId - Notification identifier
   */
  updateLastId(notId: number) {
    if (notId > this.lastIdNotification) {
      this.lastIdNotification = notId;
    }
  }
}
