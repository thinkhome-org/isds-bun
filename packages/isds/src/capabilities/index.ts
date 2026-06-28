// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export interface IsdsCapabilities {
  readonly interfaces: Readonly<Record<string, boolean>>;
  readonly messages: {
    readonly listReceived: boolean;
    readonly listSent: boolean;
    readonly read: boolean;
    readonly readAll: boolean;
    readonly send: boolean;
    readonly sendPDZ: boolean;
    readonly sendVoDZ: boolean;
    readonly erase: boolean;
    readonly archive: boolean;
  };
  readonly dataBoxes: {
    readonly search: boolean;
    readonly inspect: boolean;
    readonly administer: boolean;
  };
  readonly users: {
    readonly list: boolean;
    readonly add: boolean;
    readonly update: boolean;
    readonly remove: boolean;
  };
  readonly notifications: {
    readonly register: boolean;
    readonly consume: boolean;
  };
  readonly crypto: {
    readonly serverAuthenticate: boolean;
    readonly serverRetimestamp: boolean;
    readonly localVerify: boolean;
  };
}

export type IsdsCapabilityPatch = {
  readonly interfaces?: Readonly<Record<string, boolean>>;
  readonly messages?: Partial<IsdsCapabilities["messages"]>;
  readonly dataBoxes?: Partial<IsdsCapabilities["dataBoxes"]>;
  readonly users?: Partial<IsdsCapabilities["users"]>;
  readonly notifications?: Partial<IsdsCapabilities["notifications"]>;
  readonly crypto?: Partial<IsdsCapabilities["crypto"]>;
};

export const NO_CAPABILITIES: IsdsCapabilities = {
  interfaces: {},
  messages: {
    listReceived: false,
    listSent: false,
    read: false,
    readAll: false,
    send: false,
    sendPDZ: false,
    sendVoDZ: false,
    erase: false,
    archive: false,
  },
  dataBoxes: {
    search: false,
    inspect: false,
    administer: false,
  },
  users: {
    list: false,
    add: false,
    update: false,
    remove: false,
  },
  notifications: {
    register: false,
    consume: false,
  },
  crypto: {
    serverAuthenticate: false,
    serverRetimestamp: false,
    localVerify: false,
  },
};

export function mergeCapabilities(base: IsdsCapabilities, patch: IsdsCapabilityPatch): IsdsCapabilities {
  return {
    interfaces: { ...base.interfaces, ...patch.interfaces },
    messages: { ...base.messages, ...patch.messages },
    dataBoxes: { ...base.dataBoxes, ...patch.dataBoxes },
    users: { ...base.users, ...patch.users },
    notifications: { ...base.notifications, ...patch.notifications },
    crypto: { ...base.crypto, ...patch.crypto },
  };
}
