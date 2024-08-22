/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SortDirection } from '@elastic/eui';
import { HttpFetchQuery, HttpSetup } from '../../../../src/core/public';
import { NODE_API } from '../../common';
import {
  ChannelItemType,
  RecipientGroupItemType,
  SenderItemType,
  SenderType,
  SESSenderItemType,
} from '../../models/interfaces';
import {
  configListToChannels,
  configListToRecipientGroups,
  configListToSenders,
  configListToSESSenders,
  configToChannel,
  configToRecipientGroup,
  configToSender,
  configToSESSender,
  eventToNotification,
} from './utils/helper';

interface ConfigsResponse {
  total_hits: number;
  config_list: any[];
}

interface EventsResponse {
  total_hits: number;
  event_list: any[];
}

export default class NotificationService {
  httpClient: HttpSetup;
  dataSourceId?: string;
  multiDataSourceEnabled?: boolean;

  constructor(httpClient, dataSourceId?: string, multiDataSourceEnabled?: boolean) {
    this.httpClient = httpClient;
    this.dataSourceId = dataSourceId;
    this.multiDataSourceEnabled = multiDataSourceEnabled;
  }

  createConfig = async (config: any) => {
    let queryObj;
    if(this.multiDataSourceEnabled) {
      queryObj = {
        body: JSON.stringify({ config: config }),
        query: { dataSourceId: this.dataSourceId },
      };
    }
    else {
      queryObj = {
        body: JSON.stringify({ config: config }),
      };
    }
    const response = await this.httpClient.post(NODE_API.CREATE_CONFIG, queryObj);
    return response;
  };

  updateConfig = async (id: string, config: any) => {
    let queryObj;
    if(this.multiDataSourceEnabled) {
      queryObj = {
        body: JSON.stringify({ config: config }),
        query: { dataSourceId: this.dataSourceId },
      };
    }
    else {
      queryObj = {
        body: JSON.stringify({ config: config }),
      };
    }
    const response = await this.httpClient.put(
      `${NODE_API.UPDATE_CONFIG}/${id}`, queryObj
    );
    return response;
  };

  deleteConfigs = async (ids: string[]) => {
    let queryObject: any = {
      config_id_list: ids,
    };
    if (this.multiDataSourceEnabled) {
      queryObject = { ...queryObject, dataSourceId: this.dataSourceId };
    }
    const response = await this.httpClient.delete(NODE_API.DELETE_CONFIGS, {
      query: queryObject,
    });
    return response;
  };

  getConfigs = async (queryObject: any) => {
    if (this.multiDataSourceEnabled) {
      queryObject = { ...queryObject, dataSourceId: this.dataSourceId };
    }
    return this.httpClient.get<ConfigsResponse>(NODE_API.GET_CONFIGS, {
      query: queryObject,
    });
  };

  getConfig = async (id: string) => {
    if (this.multiDataSourceEnabled) {
      return this.httpClient.get<ConfigsResponse>(`${NODE_API.GET_CONFIG}/${id}`,{
        query: { dataSourceId: this.dataSourceId },
      });
    }
    else {
      return this.httpClient.get<ConfigsResponse>(`${NODE_API.GET_CONFIG}/${id}`);
    }
  };

  getChannels = async (
    queryObject: HttpFetchQuery // config_type: Object.keys(CHANNEL_TYPE)
  ): Promise<{ items: ChannelItemType[]; total: number }> => {
    const response = await this.getConfigs(queryObject);
    return {
      items: configListToChannels(response.config_list),
      total: response.total_hits || 0,
    };
  };

  getChannel = async (id: string): Promise<ChannelItemType> => {
    const response = await this.getConfig(id);
    return configToChannel(response.config_list[0]);
  };

  getEmailConfigDetails = async (
    channel: ChannelItemType
  ): Promise<ChannelItemType> => {
    if (!channel.email) return channel;

    const idMap: { [id: string]: string } = {};
    const ids = [
      channel.email.email_account_id,
      ...channel.email.email_group_id_list,
    ];
    let senderType: SenderType;
    const invalidIds: string[] = [];
    try {
      // try to get all sender/recipient configs used in email in one call
      await this.getConfigs({
        from_index: 0,
        max_items: ids.length,
        config_id_list: ids,
        sort_order: SortDirection.ASC,
        sort_field: 'name',
        config_type: ['smtp_account', 'ses_account', 'email_group'],
      })
        .then((response) => {
          response.config_list.map((config) => {
            if (config.config_id === channel.email?.email_account_id)
              senderType = config.config.config_type;
            idMap[config.config_id] = config.config.name;
          });
        })
        .catch(async (error) => {
          console.error(
            'error fetching email senders and recipients, retrying',
            error
          );
          // some configs no longer exist and request failed, need to request one by one
          // TODO limit concurrency here?
          await Promise.all(
            ids.map((config_id) =>
              this.getConfig(config_id)
                .then((response) => {
                  const config = response.config_list[0];
                  if (config.config_id === channel.email?.email_account_id)
                    senderType = config.config.config_type;
                  idMap[config_id] = config.config.name;
                })
                .catch((error) => {
                  invalidIds.push(config_id);
                  console.error(
                    `error fetching config id ${config_id}:`,
                    error
                  );
                  idMap[config_id] = '(invalid-id)';
                })
            )
          );
        });

      channel.email.sender_type = senderType! || 'smtp_account';
      channel.email.email_account_name = idMap[channel.email.email_account_id];
      channel.email.email_group_id_map = {};
      channel.email.email_group_id_list.map(
        (id) => (channel.email!.email_group_id_map![id] = idMap[id])
      );
      channel.email.invalid_ids = invalidIds;
    } catch (error) {
      console.error('error fetching email senders and recipients', error);
    }
    return channel;
  };

  getSenders = async (
    queryObject: HttpFetchQuery // config_type: 'smtp_account'
  ): Promise<{ items: SenderItemType[]; total: number }> => {
    const response = await this.getConfigs(queryObject);
    return {
      items: configListToSenders(response.config_list),
      total: response.total_hits || 0,
    };
  };

  getSender = async (id: string): Promise<SenderItemType> => {
    const response = await this.getConfig(id);
    return configToSender(response.config_list[0]);
  };

  getSESSenders = async (
    queryObject: HttpFetchQuery // config_type: 'ses_account'
  ): Promise<{ items: SESSenderItemType[]; total: number }> => {
    const response = await this.getConfigs(queryObject);
    return {
      items: configListToSESSenders(response.config_list),
      total: response.total_hits || 0,
    };
  };

  getSESSender = async (id: string): Promise<SESSenderItemType> => {
    const response = await this.getConfig(id);
    return configToSESSender(response.config_list[0]);
  };

  getRecipientGroups = async (
    queryObject: HttpFetchQuery // config_type: 'email_group'
  ): Promise<{ items: RecipientGroupItemType[]; total: number }> => {
    const response = await this.getConfigs(queryObject);
    return {
      items: configListToRecipientGroups(response.config_list),
      total: response.total_hits || 0,
    };
  };

  getRecipientGroup = async (id: string): Promise<RecipientGroupItemType> => {
    const response = await this.getConfig(id);
    return configToRecipientGroup(response.config_list[0]);
  };

  getServerFeatures = async () => {
    try {
      const query = this.multiDataSourceEnabled ? { dataSourceId: this.dataSourceId } : undefined;
      const response = await this.httpClient.get(NODE_API.GET_AVAILABLE_FEATURES, { query });
      return response;
    } catch (error) {
      console.error('error fetching available features', error);
      return null;
    }
  };

  getNotification = async (id: string) => {
    let response;
    if (this.multiDataSourceEnabled) {
      response = await this.httpClient.get<EventsResponse>(
        `${NODE_API.GET_EVENT}/${id}`, {
          query: { dataSourceId: this.dataSourceId },
        }
      );
    }
    else {
      response = await this.httpClient.get<EventsResponse>(
        `${NODE_API.GET_EVENT}/${id}`
      );
    }
    return eventToNotification(response.event_list[0]);
  };

  sendTestMessage = async (
      configId: string
  ) => {
    let response;
    if (this.multiDataSourceEnabled) {
      response = await this.httpClient.post(
        `${NODE_API.SEND_TEST_MESSAGE}/${configId}`,{
        query: { dataSourceId: this.dataSourceId },
      });
    }
    else {
      response = await this.httpClient.post(
        `${NODE_API.SEND_TEST_MESSAGE}/${configId}`);
    }
    if (response.status_list[0].delivery_status.status_code != 200) {
      console.error(response);
      const error = new Error('Failed to send the test message.');
      error.stack = JSON.stringify(response, null, 2);
      throw error;
    }
    return response;
  };
}
