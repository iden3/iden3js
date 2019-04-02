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
   * Checks notification: verify signed packet and retrieve useful notification information
   */
  checkNot(not: Notification): ?NotificationFull {
    const result = this.verifier.verifySignedPacketMessage(not.jws);
    if (result == null) {
      // console.error('DBG not.verify = null');
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

  updateLastId(notId: number) {
    if (notId > this.lastIdNotification) {
      this.lastIdNotification = notId;
    }
  }
}
