import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import {
  IAcessToken,
  IUser,
  ISearchResponse,
  IUserPresence,
  IGetUserQueuesResponse,
  IUserQueue,
  IGetRoutingSkillsResponse,
  IRoutingSkill,
  IQueueMember,
  IGetMembersResponse,
  IGetSimplifiedQueuesResponse,
  ISimplifiedQueue,
  ICreateCallbackResponse,
} from './interfaces/genesyscloud';
import { UserStatus } from './enums';
import { NotFoundError } from './errors';
import { chunk } from 'lodash';

export default class GenesysCloud {
  private instance = rateLimit(axios.create({ baseURL: 'https://api.mypurecloud.de' }), {
    maxRequests: 1,
    perMilliseconds: 250,
  });

  async loginWithClientCredentials(id: string, secret: string): Promise<IAcessToken> {
    const body = 'grant_type=client_credentials';
    const config = {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      auth: { username: id, password: secret },
    };
    const { data: response } = await axios.post<IAcessToken>('https://login.mypurecloud.de/oauth/token', body, config);
    this.instance.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;
    return response;
  }

  setAccessToken(token: IAcessToken) {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token.access_token}`;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const body = {
      query: [{ type: 'EXACT', fields: ['email'], value: email }],
      expand: ['groups'],
      enforcePermissions: true,
    };
    const { data: response } = await this.instance.post<ISearchResponse>('/api/v2/users/search', body);
    if (response.total !== 1) throw new Error(`user with email ${email} not found in genesys cloud`);
    return response.results[0];
  }

  async getUsersByEmail(emails: string[]): Promise<IUser[]> {
    const uniqeEmails = [...new Set(emails)];
    const chunkedEmails = chunk(uniqeEmails, 50);
    const requests = chunkedEmails.map((c) => {
      const body = {
        query: [{ type: 'EXACT', fields: ['email'], values: c }],
        expand: ['groups', 'presence', 'station'],
        enforcePermissions: true,
        pageSize: 999,
        pageNumber: 1,
      };
      return this.instance.post<ISearchResponse>('/api/v2/users/search', body);
    });
    const responses = await Promise.all(requests);
    return responses.flatMap((response) => response.data.results);
  }

  async getUserStatus(userId: string): Promise<IUserPresence> {
    const { data: response } = await this.instance.get<IUserPresence>(`/api/v2/users/${userId}/presences/purecloud`);
    return response;
  }

  async setUserStatus(userId: string, status: UserStatus): Promise<IUserPresence> {
    const body = {
      presenceDefinition: {
        id: status,
      },
    };
    const { data: response } = await this.instance.patch<IUserPresence>(`/api/v2/users/${userId}/presences/purecloud`, body);
    return response;
  }

  async setBulkUserStatus(userIds: string[], status: UserStatus): Promise<IUserPresence[]> {
    const chunkedUserIds = chunk(userIds, 50);
    const requests = chunkedUserIds.map((c) => {
      const body = c.map((userId) => ({
        id: userId,
        source: 'PURECLOUD',
        presenceDefinition: {
          id: status,
        },
      }));
      return this.instance.put<IUserPresence[]>('/api/v2/users/presences/bulk', body);
    });
    const responses = await Promise.all(requests);
    return responses.flatMap((response) => response.data);
  }

  async getQueuesForUser(userId: string): Promise<IUserQueue[]> {
    const { data: response } = await this.instance.get<IGetUserQueuesResponse>(`/api/v2/users/${userId}/queues?pageSize=999&pageNumber=1`);
    return response.entities;
  }

  async joinQueuesForUser(userId: string, queues: IUserQueue[], joined: boolean) {
    const body = queues.map((queue) => ({ id: queue.id, joined }));
    await this.instance.patch(`/api/v2/users/${userId}/queues`, body);
  }

  async getAllRoutingSkills(): Promise<IRoutingSkill[]> {
    const { data: response } = await this.instance.get<IGetRoutingSkillsResponse>('/api/v2/routing/skills?pageSize=999&pageNumber=1');
    return response.entities;
  }

  async addRoutingSkillsToUser(userId: string, skills: { id: string; proficiency: number }[]) {
    await this.instance.patch(`/api/v2/users/${userId}/routingskills/bulk`, skills);
  }

  async getQueueMembers(queueId: string): Promise<string[]> {
    try {
      let uri: string | undefined = `/api/v2/routing/queues/${queueId}/members?pageSize=999`;
      let entities: IQueueMember[] = [];
      while (uri) {
        const { data } = await this.instance.get<IGetMembersResponse>(uri);
        uri = data.nextUri;
        entities = [...entities, ...data.entities];
      }
      return entities.map((entity) => entity.user.email);
    } catch (error) {
      if (error.response?.status === 404) throw new NotFoundError(`queue with id ${queueId} not found`);
      throw new Error('failed to get queue members');
    }
  }

  async clearAssociatedStation(userId: string) {
    await this.instance.delete(`/api/v2/users/${userId}/station/associatedstation`);
  }

  async getAllQueues(): Promise<ISimplifiedQueue[]> {
    const response = await this.instance.get<IGetSimplifiedQueuesResponse>('/api/v2/routing/queues/divisionviews/all?pageSize=999&pageNumber=1');
    return response.data.entities;
  }

  async addQueuesToUser(userId: string, queueIds: string[]) {
    const requests = queueIds.map((queueId) => {
      const body = [{ id: userId }];
      return this.instance.post(`/api/v2/routing/queues/${queueId}/members`, body);
    });
    await Promise.all(requests);
  }

  async createCallback(body: object): Promise<ICreateCallbackResponse> {
    const { data: response } = await this.instance.post<ICreateCallbackResponse>('/api/v2/conversations/callbacks', body);
    return response;
  }
}
