// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsConfigurationError, IsdsStatusError } from "../errors/index.ts";
import type { RawSoapClient } from "../raw/index.ts";
import { escapeXmlText } from "../xml/index.ts";

export interface DbStatusResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly rawXml: string;
}

export interface DataBoxOwnerInfo {
  readonly boxId?: string;
  readonly aifoIsds?: boolean;
  readonly type?: string;
  readonly ic?: string;
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly firmName?: string;
  readonly birthDate?: string;
  readonly birthCity?: string;
  readonly birthCounty?: string;
  readonly birthState?: string;
  readonly city?: string;
  readonly district?: string;
  readonly street?: string;
  readonly numberInStreet?: string;
  readonly numberInMunicipality?: string;
  readonly zipCode?: string;
  readonly state?: string;
  readonly nationality?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly identifier?: string;
  readonly registryCode?: string;
  readonly stateCode?: number;
  readonly effectiveOvm?: boolean;
  readonly openAddressing?: boolean;
  readonly ovmId?: string;
  readonly upperBoxId?: string;
}

export interface DataBoxUserInfo {
  readonly aifoIsds?: boolean;
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly city?: string;
  readonly street?: string;
  readonly zipCode?: string;
  readonly state?: string;
  readonly birthDate?: string;
  readonly userId?: string;
  readonly isdsId?: string;
  readonly userType?: string;
  readonly privileges?: number;
  readonly ic?: string;
  readonly firmName?: string;
}

export interface DataBoxOwnerResult extends DbStatusResult {
  readonly owner?: DataBoxOwnerInfo;
}

export interface DataBoxUserResult extends DbStatusResult {
  readonly user?: DataBoxUserInfo;
}

export interface PasswordInfoResult extends DbStatusResult {
  readonly expiresAt?: string;
}

export type ChangePasswordResult = DbStatusResult;

export interface DataBoxCheckResult extends DbStatusResult {
  readonly state?: number;
}

export interface DataBoxListResult extends DbStatusResult {
  readonly data?: string;
}

export interface FindDataBoxesOptions {
  readonly boxId?: string;
  readonly type?: string;
  readonly ic?: string;
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly firmName?: string;
  readonly city?: string;
  readonly street?: string;
  readonly zipCode?: string;
  readonly signal?: AbortSignal;
}

export interface FindDataBoxesResult extends DbStatusResult {
  readonly records: readonly DataBoxOwnerInfo[];
}

export interface IsdsSearchOptions {
  readonly text: string;
  readonly type?: "GENERAL" | "ADDRESS" | "ICO" | "IDOVM" | "DBID";
  readonly scope?: string;
  readonly page?: number | null;
  readonly pageSize?: number | null;
  readonly highlighting?: boolean | null;
  readonly signal?: AbortSignal;
}

export interface IsdsSearchRecord {
  readonly boxId?: string;
  readonly type?: string;
  readonly name?: string;
  readonly address?: string;
  readonly birthDate?: string;
  readonly ic?: string;
  readonly ovmId?: string;
  readonly sendOptions?: string;
}

export interface IsdsSearchResult extends DbStatusResult {
  readonly totalCount?: number;
  readonly currentCount?: number;
  readonly position?: number;
  readonly lastPage?: boolean;
  readonly records: readonly IsdsSearchRecord[];
}

export interface PdzRecord {
  readonly type?: string;
  readonly recipientBoxId?: string;
  readonly payerBoxId?: string;
  readonly expiresAt?: string;
  readonly count?: number;
  readonly odzIdentifier?: string;
}

export interface PdzInfoResult extends DbStatusResult {
  readonly records: readonly PdzRecord[];
}

export interface CreditInfoOptions {
  readonly fromDate?: Date | string | null;
  readonly toDate?: Date | string | null;
  readonly signal?: AbortSignal;
}

export interface CreditRecord {
  readonly eventTime?: string;
  readonly eventType?: number;
  readonly creditChange?: number;
  readonly creditAfter?: number;
  readonly transactionId?: string;
  readonly recipientBoxId?: string;
  readonly pdzId?: string;
  readonly doneBy?: string;
}

export interface CreditInfoResult extends DbStatusResult {
  readonly currentCredit?: number;
  readonly notificationEmail?: string;
  readonly records: readonly CreditRecord[];
}

export interface ActivityPeriod {
  readonly from?: string;
  readonly to?: string;
  readonly state?: number;
}

export interface ActivityStatusResult extends DbStatusResult {
  readonly boxId?: string;
  readonly periods: readonly ActivityPeriod[];
}

export interface DtInfoResult extends DbStatusResult {
  readonly activeType?: number;
  readonly activeCapacity?: number;
  readonly activeFrom?: string;
  readonly activeTo?: string;
  readonly activeUsed?: number;
  readonly futureType?: number;
  readonly futureCapacity?: number;
  readonly futureFrom?: string;
  readonly futureTo?: string;
  readonly futurePaid?: number;
}

export interface PdzSendInfoResult extends DbStatusResult {
  readonly allowed?: boolean;
}

export interface ConstantRecord {
  readonly name?: string;
  readonly value?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface ConstantsResult extends DbStatusResult {
  readonly records: readonly ConstantRecord[];
}

export interface DataBoxAddressResult extends DbStatusResult {
  readonly city?: string;
  readonly district?: string;
  readonly street?: string;
  readonly numberInStreet?: string;
  readonly numberInMunicipality?: string;
  readonly zipCode?: string;
  readonly state?: string;
  readonly registrationNumber?: string;
  readonly fullAddress1?: string;
  readonly fullAddress2?: string;
}

function nilElement(name: string): string {
  return `<${name} xsi:nil="true"/>`;
}

function valueElement(name: string, value: string | number | boolean | Date | null | undefined): string {
  if (value === null || value === undefined) return nilElement(name);
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `<${name}>${escapeXmlText(text)}</${name}>`;
}

function dateElement(name: string, value: Date | string | null | undefined): string {
  if (value === null || value === undefined) return nilElement(name);
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  return `<${name}>${escapeXmlText(text)}</${name}>`;
}

function operationXml(operation: string, body = ""): string {
  return `<${operation} xmlns="http://isds.czechpoint.cz/v20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${body}</${operation}>`;
}

function dummyRequest(operation: string): string {
  return operationXml(operation, valueElement("dbDummy", ""));
}

function firstText(xml: string, name: string): string | undefined {
  const match = new RegExp(`<(?:[\\w.-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${name}>`).exec(xml);
  return match?.[1]
    ?.replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function numberFrom(xml: string, name: string): number | undefined {
  const text = firstText(xml, name);
  if (!text) return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

function booleanFrom(xml: string, name: string): boolean | undefined {
  const text = firstText(xml, name);
  if (text === "true" || text === "1") return true;
  if (text === "false" || text === "0") return false;
  return undefined;
}

function elementBody(xml: string, name: string): string | undefined {
  return new RegExp(`<((?:[\\w.-]+:)?${name})(?:\\s[^>]*)?>([\\s\\S]*?)<\\/\\1>`).exec(xml)?.[2];
}

function dbStatusFrom(rawXml: string): { statusCode: string; statusMessage: string } {
  return {
    statusCode: firstText(rawXml, "dbStatusCode") ?? "",
    statusMessage: firstText(rawXml, "dbStatusMessage") ?? "",
  };
}

function assertDbOk(rawXml: string): { statusCode: string; statusMessage: string } {
  const status = dbStatusFrom(rawXml);
  if (status.statusCode !== "0000") {
    throw new IsdsStatusError("ISDS returned an application status error.", status);
  }
  return status;
}

function copyDefined<T extends object>(target: T, values: Record<string, unknown>): T {
  const record = target as Record<string, unknown>;
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) record[key] = value;
  }
  return target;
}

function parseOwnerInfo(xml: string): DataBoxOwnerInfo {
  return copyDefined({}, {
    boxId: firstText(xml, "dbID"),
    aifoIsds: booleanFrom(xml, "aifoIsds"),
    type: firstText(xml, "dbType"),
    ic: firstText(xml, "ic"),
    firstName: firstText(xml, "pnFirstName"),
    middleName: firstText(xml, "pnMiddleName"),
    lastName: firstText(xml, "pnLastName"),
    firmName: firstText(xml, "firmName"),
    birthDate: firstText(xml, "biDate"),
    birthCity: firstText(xml, "biCity"),
    birthCounty: firstText(xml, "biCounty"),
    birthState: firstText(xml, "biState"),
    city: firstText(xml, "adCity"),
    district: firstText(xml, "adDistrict"),
    street: firstText(xml, "adStreet"),
    numberInStreet: firstText(xml, "adNumberInStreet"),
    numberInMunicipality: firstText(xml, "adNumberInMunicipality"),
    zipCode: firstText(xml, "adZipCode"),
    state: firstText(xml, "adState"),
    nationality: firstText(xml, "nationality"),
    email: firstText(xml, "email"),
    phone: firstText(xml, "telNumber"),
    identifier: firstText(xml, "identifier"),
    registryCode: firstText(xml, "registryCode"),
    stateCode: numberFrom(xml, "dbState"),
    effectiveOvm: booleanFrom(xml, "dbEffectiveOVM"),
    openAddressing: booleanFrom(xml, "dbOpenAddressing"),
    ovmId: firstText(xml, "dbIdOVM"),
    upperBoxId: firstText(xml, "dbUpperID"),
  }) as DataBoxOwnerInfo;
}

function parseUserInfo(xml: string): DataBoxUserInfo {
  return copyDefined({}, {
    aifoIsds: booleanFrom(xml, "aifoIsds"),
    firstName: firstText(xml, "pnFirstName"),
    middleName: firstText(xml, "pnMiddleName"),
    lastName: firstText(xml, "pnLastName"),
    city: firstText(xml, "adCity"),
    street: firstText(xml, "adStreet"),
    zipCode: firstText(xml, "adZipCode"),
    state: firstText(xml, "adState"),
    birthDate: firstText(xml, "biDate"),
    userId: firstText(xml, "userID"),
    isdsId: firstText(xml, "isdsID"),
    userType: firstText(xml, "userType"),
    privileges: numberFrom(xml, "userPrivils"),
    ic: firstText(xml, "ic"),
    firmName: firstText(xml, "firmName"),
  }) as DataBoxUserInfo;
}

function parseOwnerRecords(xml: string): DataBoxOwnerInfo[] {
  const records: DataBoxOwnerInfo[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dbOwnerInfo)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    records.push(parseOwnerInfo(match[2] ?? ""));
  }
  return records;
}

function parseSearchRecords(xml: string): IsdsSearchRecord[] {
  const records: IsdsSearchRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dbResult)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    records.push(copyDefined({}, {
      boxId: firstText(body, "dbID"),
      type: firstText(body, "dbType"),
      name: firstText(body, "dbName"),
      address: firstText(body, "dbAddress"),
      birthDate: firstText(body, "dbBiDate"),
      ic: firstText(body, "dbICO"),
      ovmId: firstText(body, "dbIdOVM"),
      sendOptions: firstText(body, "dbSendOptions"),
    }) as IsdsSearchRecord);
  }
  return records;
}

function parsePdzRecords(xml: string): PdzRecord[] {
  const records: PdzRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dbPDZRecord)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    records.push(copyDefined({}, {
      type: firstText(body, "PDZType"),
      recipientBoxId: firstText(body, "PDZRecip"),
      payerBoxId: firstText(body, "PDZPayer"),
      expiresAt: firstText(body, "PDZExpire"),
      count: numberFrom(body, "PDZCnt"),
      odzIdentifier: firstText(body, "ODZIdent"),
    }) as PdzRecord);
  }
  return records;
}

function parseCreditRecords(xml: string): CreditRecord[] {
  const records: CreditRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?ciRecord)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    records.push(copyDefined({}, {
      eventTime: firstText(body, "ciEventTime"),
      eventType: numberFrom(body, "ciEventType"),
      creditChange: numberFrom(body, "ciCreditChange"),
      creditAfter: numberFrom(body, "ciCreditAfter"),
      transactionId: firstText(body, "ciTransID"),
      recipientBoxId: firstText(body, "ciRecipientID"),
      pdzId: firstText(body, "ciPDZID"),
      doneBy: firstText(body, "ciDoneBy"),
    }) as CreditRecord);
  }
  return records;
}

function parseActivityPeriods(xml: string): ActivityPeriod[] {
  const periods: ActivityPeriod[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?Period)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    periods.push(copyDefined({}, {
      from: firstText(body, "PeriodFrom"),
      to: firstText(body, "PeriodTo"),
      state: numberFrom(body, "DbState"),
    }) as ActivityPeriod);
  }
  return periods;
}

function parseConstants(xml: string): ConstantRecord[] {
  const records: ConstantRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?constRecord)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    records.push(copyDefined({}, {
      name: firstText(body, "cName"),
      value: firstText(body, "cValue"),
      from: firstText(body, "cFrom"),
      to: firstText(body, "cTo"),
    }) as ConstantRecord);
  }
  return records;
}

function ownerCriteriaXml(criteria: FindDataBoxesOptions): string {
  return `<dbOwnerInfo>` +
    valueElement("dbID", criteria.boxId) +
    valueElement("dbType", criteria.type) +
    valueElement("ic", criteria.ic) +
    valueElement("pnFirstName", criteria.firstName) +
    valueElement("pnMiddleName", criteria.middleName) +
    valueElement("pnLastName", criteria.lastName) +
    valueElement("firmName", criteria.firmName) +
    valueElement("adCity", criteria.city) +
    valueElement("adStreet", criteria.street) +
    valueElement("adZipCode", criteria.zipCode) +
    `</dbOwnerInfo>`;
}

export class DataBoxesClient {
  constructor(
    private readonly raw: RawSoapClient,
    private readonly ensureInitialized: () => Promise<void>,
  ) {}

  async getOwnerInfo(options: { signal?: AbortSignal } = {}): Promise<DataBoxOwnerResult> {
    return this.getOwnerInfoByOperation("GetOwnerInfoFromLogin2", options);
  }

  async getOwnerInfoLegacy(options: { signal?: AbortSignal } = {}): Promise<DataBoxOwnerResult> {
    return this.getOwnerInfoByOperation("GetOwnerInfoFromLogin", options);
  }

  private async getOwnerInfoByOperation(operation: "GetOwnerInfoFromLogin" | "GetOwnerInfoFromLogin2", options: { signal?: AbortSignal }): Promise<DataBoxOwnerResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(operation, dummyRequest(operation), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    const owner = elementBody(rawXml, "dbOwnerInfo");
    return { statusCode, statusMessage, ...(owner ? { owner: parseOwnerInfo(owner) } : {}), rawXml };
  }

  async getUserInfo(options: { signal?: AbortSignal } = {}): Promise<DataBoxUserResult> {
    return this.getUserInfoByOperation("GetUserInfoFromLogin2", options);
  }

  async getUserInfoLegacy(options: { signal?: AbortSignal } = {}): Promise<DataBoxUserResult> {
    return this.getUserInfoByOperation("GetUserInfoFromLogin", options);
  }

  private async getUserInfoByOperation(operation: "GetUserInfoFromLogin" | "GetUserInfoFromLogin2", options: { signal?: AbortSignal }): Promise<DataBoxUserResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(operation, dummyRequest(operation), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    const user = elementBody(rawXml, "dbUserInfo");
    return { statusCode, statusMessage, ...(user ? { user: parseUserInfo(user) } : {}), rawXml };
  }

  async getPasswordInfo(options: { signal?: AbortSignal } = {}): Promise<PasswordInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("GetPasswordInfo", dummyRequest("GetPasswordInfo"), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    const expiresAt = firstText(rawXml, "pswExpDate");
    return { statusCode, statusMessage, ...(expiresAt ? { expiresAt } : {}), rawXml };
  }

  async changePassword(oldPassword: string, newPassword: string, options: { signal?: AbortSignal } = {}): Promise<ChangePasswordResult> {
    if (!oldPassword || !newPassword) {
      throw new IsdsConfigurationError("ChangeISDSPassword requires old and new passwords.");
    }
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "ChangeISDSPassword",
      operationXml("ChangeISDSPassword", valueElement("dbOldPassword", oldPassword) + valueElement("dbNewPassword", newPassword)),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return { statusCode, statusMessage, rawXml };
  }

  async findDataBoxes(criteria: FindDataBoxesOptions): Promise<FindDataBoxesResult> {
    return this.findDataBoxesByOperation("FindDataBox2", criteria);
  }

  async findDataBoxesLegacy(criteria: FindDataBoxesOptions): Promise<FindDataBoxesResult> {
    return this.findDataBoxesByOperation("FindDataBox", criteria);
  }

  private async findDataBoxesByOperation(operation: "FindDataBox" | "FindDataBox2", criteria: FindDataBoxesOptions): Promise<FindDataBoxesResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(operation, operationXml(operation, ownerCriteriaXml(criteria)), criteria.signal ? { signal: criteria.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return { statusCode, statusMessage, records: parseOwnerRecords(rawXml), rawXml };
  }

  async checkDataBox(boxId: string, options: { signal?: AbortSignal } = {}): Promise<DataBoxCheckResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("CheckDataBox", operationXml("CheckDataBox", valueElement("dbID", boxId)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<DataBoxCheckResult>({ statusCode, statusMessage, rawXml }, { state: numberFrom(rawXml, "dbState") });
  }

  async getDataBoxList(type: string, options: { signal?: AbortSignal } = {}): Promise<DataBoxListResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("GetDataBoxList", operationXml("GetDataBoxList", valueElement("dblType", type)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    const data = firstText(rawXml, "dblData");
    return { statusCode, statusMessage, ...(data ? { data } : {}), rawXml };
  }

  async pdzInfo(senderBoxId: string, options: { signal?: AbortSignal } = {}): Promise<PdzInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("PDZInfo", operationXml("PDZInfo", valueElement("PDZSender", senderBoxId)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return { statusCode, statusMessage, records: parsePdzRecords(rawXml), rawXml };
  }

  async creditInfo(boxId: string, options: CreditInfoOptions = {}): Promise<CreditInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "DataBoxCreditInfo",
      operationXml("DataBoxCreditInfo", valueElement("dbID", boxId) + dateElement("ciFromDate", options.fromDate) + dateElement("ciTodate", options.toDate)),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    const notificationEmail = firstText(rawXml, "notifEmail");
    return copyDefined<CreditInfoResult>({
      statusCode,
      statusMessage,
      records: parseCreditRecords(rawXml),
      rawXml,
    }, {
      currentCredit: numberFrom(rawXml, "currentCredit"),
      notificationEmail,
    });
  }

  async search(options: IsdsSearchOptions): Promise<IsdsSearchResult> {
    return this.searchByOperation("ISDSSearch3", options);
  }

  async searchLegacy(options: IsdsSearchOptions): Promise<IsdsSearchResult> {
    return this.searchByOperation("ISDSSearch2", options);
  }

  private async searchByOperation(operation: "ISDSSearch2" | "ISDSSearch3", options: IsdsSearchOptions): Promise<IsdsSearchResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      operation,
      operationXml(operation,
        valueElement("searchText", options.text) +
        valueElement("searchType", options.type ?? "GENERAL") +
        valueElement("searchScope", options.scope ?? "ALL") +
        valueElement("page", options.page ?? 1) +
        valueElement("pageSize", options.pageSize ?? 10) +
        (options.highlighting === undefined ? "" : valueElement("highlighting", options.highlighting))
      ),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<IsdsSearchResult>({
      statusCode,
      statusMessage,
      records: parseSearchRecords(rawXml),
      rawXml,
    }, {
      totalCount: numberFrom(rawXml, "totalCount"),
      currentCount: numberFrom(rawXml, "currentCount"),
      position: numberFrom(rawXml, "position"),
      lastPage: booleanFrom(rawXml, "lastPage"),
    });
  }

  async getActivityStatus(boxId: string, fromTime: Date | string, toTime: Date | string, options: { signal?: AbortSignal } = {}): Promise<ActivityStatusResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "GetDataBoxActivityStatus",
      operationXml("GetDataBoxActivityStatus", valueElement("dbID", boxId) + valueElement("baFrom", fromTime) + valueElement("baTo", toTime)),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<ActivityStatusResult>({ statusCode, statusMessage, periods: parseActivityPeriods(rawXml), rawXml }, { boxId: firstText(rawXml, "dbID") });
  }

  async findPersonalDataBox(criteria: FindDataBoxesOptions): Promise<FindDataBoxesResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("FindPersonalDataBox", operationXml("FindPersonalDataBox", ownerCriteriaXml(criteria)), criteria.signal ? { signal: criteria.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return { statusCode, statusMessage, records: parseOwnerRecords(rawXml), rawXml };
  }

  async dtInfo(boxId: string, options: { signal?: AbortSignal } = {}): Promise<DtInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("DTInfo", operationXml("DTInfo", valueElement("dbId", boxId)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<DtInfoResult>({
      statusCode,
      statusMessage,
      rawXml,
    }, {
      activeType: numberFrom(rawXml, "ActDTType"),
      activeCapacity: numberFrom(rawXml, "ActDTCapacity"),
      activeFrom: firstText(rawXml, "ActDTFrom"),
      activeTo: firstText(rawXml, "ActDTTo"),
      activeUsed: numberFrom(rawXml, "ActDTCapUsed"),
      futureType: numberFrom(rawXml, "FutDTType"),
      futureCapacity: numberFrom(rawXml, "FutDTCapacity"),
      futureFrom: firstText(rawXml, "FutDTFrom"),
      futureTo: firstText(rawXml, "FutDTTo"),
      futurePaid: numberFrom(rawXml, "FutDTPaid"),
    });
  }

  async pdzSendInfo(boxId: string, type: "Normal" | "Init" | "VoDZ", options: { signal?: AbortSignal } = {}): Promise<PdzSendInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("PDZSendInfo", operationXml("PDZSendInfo", valueElement("dbId", boxId) + valueElement("PDZType", type)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<PdzSendInfoResult>({ statusCode, statusMessage, rawXml }, { allowed: booleanFrom(rawXml, "PDZsiResult") });
  }

  async getConstants(date?: Date | string | null, options: { signal?: AbortSignal } = {}): Promise<ConstantsResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("GetConstants", operationXml("GetConstants", dateElement("constDate", date)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return { statusCode, statusMessage, records: parseConstants(rawXml), rawXml };
  }

  async getAddress(boxId: string, options: { signal?: AbortSignal } = {}): Promise<DataBoxAddressResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml("GetDataBoxAddress", operationXml("GetDataBoxAddress", valueElement("dbID", boxId)), options.signal ? { signal: options.signal } : {});
    const { statusCode, statusMessage } = assertDbOk(rawXml);
    return copyDefined<DataBoxAddressResult>({ statusCode, statusMessage, rawXml }, {
      city: firstText(rawXml, "adCity"),
      district: firstText(rawXml, "adDistrict"),
      street: firstText(rawXml, "adStreet"),
      numberInStreet: firstText(rawXml, "adNumberInStreet"),
      numberInMunicipality: firstText(rawXml, "adNumberInMunicipality"),
      zipCode: firstText(rawXml, "adZipCode"),
      state: firstText(rawXml, "adState"),
      registrationNumber: firstText(rawXml, "adRegistrationNumber"),
      fullAddress1: firstText(rawXml, "adFullAddress1"),
      fullAddress2: firstText(rawXml, "adFullAddress2"),
    });
  }
}
