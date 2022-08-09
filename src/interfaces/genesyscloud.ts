export interface IAcessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface IAddress {
  address: string;
  mediaType: string;
  type: string;
}

export interface IAuthorization {
  roles: Array<{ id: string; name: string }>;
  permissions: Array<string>;
  permissionPolicies: Array<{
    domain: string;
    entityName: string;
    allowConditions: boolean;
    resourceConditionNode?: Object;
    namedResources?: Array<string>;
    resourceCondition?: string;
    actionSet: Array<string>;
  }>;
}

export interface IGetMembersResponse {
  entities: Array<IQueueMember>;
  pageSize: number;
  pageNumber: number;
  firstUri: string;
  selfUri: string;
  nextUri?: string;
}

export interface IGetRoutingSkillsResponse {
  entities: Array<IRoutingSkill>;
  pageSize: number;
  pageNumber: number;
  total: number;
  firstUri: string;
  selfUri: string;
  lastUri: string;
  nextUri?: string;
  pageCount: number;
}

export interface IGetUserQueuesResponse {
  entities: Array<IUserQueue>;
  pageSize: number;
  pageNumber: number;
  total: number;
  firstUri: string;
  selfUri: string;
  lastUri: string;
  nextUri?: string;
  pageCount: number;
}

export interface IImage {
  resolution: string;
  imageUri: string;
}

export interface IOrganization {
  id: string;
  name: string;
  defaultLanguage: string;
  defaultCountryCode: string;
  thirdPartyOrgName: string;
  domain: string;
  version: number;
  state: string;
  defaultSiteId: string;
  thirdPartyOrgId: string;
  deletable: boolean;
  supportURI: string;
  voicemailEnabled: boolean;
  productPlatform: string;
  selfUri: string;
  features: {
    chat: boolean;
    contactCenter: boolean;
    directory: boolean;
    informalPhotos: boolean;
    purecloud: boolean;
    purecloudVoice: boolean;
    realtimeCIC: boolean;
    unifiedCommunications: boolean;
    hipaa: boolean;
    pci: boolean;
    xmppFederation: boolean;
  };
}

export interface IQueueMember {
  id: string;
  name: string;
  user: IUser;
  ringNumber: number;
  joined: boolean;
  memberBy: string;
}

export interface IRoutingSkill {
  id: string;
  name: string;
  dateModified: string;
  state: string;
  version: string;
  selfUri: string;
}

export interface ISearchResponse {
  total: number;
  pageCount: number;
  pageSize: number;
  pageNumber: number;
  currentPage: string;
  nextPage?: string;
  types: Array<string>;
  results: Array<IUser>;
}

export interface IUser {
  id: string;
  name: string;
  division: {
    id: string;
    name: string;
    selfUri: string;
  };
  groups?: Array<{
    id: string;
    selfUri: string;
  }>;
  presence?: IUserPresence;
  station?: {
    associatedStation?: IStation;
    effectiveStation?: IStation;
    defaultStation?: IDefaultStation;
    lastAssociatedStation?: IStation | IDefaultStation;
  };
  chat: Object;
  email: string;
  primaryContactInfo: Array<IAddress>;
  addresses: Array<IAddress>;
  state: string;
  username: string;
  images?: Array<IImage>;
  version: number;
  authorization?: IAuthorization;
  acdAutoAnswer: boolean;
  organization?: IOrganization;
  selfUri: string;
}

export interface IUserPresence {
  source: string;
  presenceDefinition: {
    id: string;
    systemPresence: string;
    selfUri: string;
  };
  message: string;
  modifiedDate: string;
  selfUri: string;
}

export interface IUserQueue {
  id: string;
  name: string;
  joined: boolean;
  selfUri: string;
}

export interface IStation {
  id: string;
  associatedUser: {
    id: string;
    selfUri: string;
  };
  associatedDate: string;
  providerInfo: {
    locationId: string;
    name: string;
    edgeGroupId: string;
  };
}

export interface IDefaultStation {
  id: string;
  defaultUser: {
    id: string;
    selfUri: string;
  };
  providerInfo: {
    locationId: string;
    name: string;
    edgeGroupId: string;
  };
}

export interface IGetSimplifiedQueuesResponse {
  entities: Array<ISimplifiedQueue>;
  pageSize: number;
  pageNumber: number;
  total: number;
  lastUri: string;
  firstUri: string;
  selfUri: string;
  nextUri?: string;
  pageCount: number;
}

export interface ISimplifiedQueue {
  id: string;
  name: string;
  division: {
    id: string;
    name: string;
    selfUri: string;
  };
  selfUri: string;
}
