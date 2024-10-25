/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  ILegacyScopedClusterClient,
  IRouter,
} from '../../../../src/core/server';
import { NODE_API } from '../../common';
import { joinRequestParams } from '../utils/helper';
import _ from 'lodash';
import { CHANNEL_TYPE } from '../../common/constants';
import { MDSEnabledClientService } from '../../common/MDSEnabledClientService';

interface Schema {
  [key: string]: any;
}

interface GenericQueryAndBody {
  body: any;
  query?: any;
}

interface UpdateQuerySchema {
  body: any;
  params: { configId: string };
  query?: { dataSourceId: string };
}

interface DeleteQuerySchema {
  config_id_list: string | string[];
  dataSourceId?: string;
}

export function configRoutes(router: IRouter, dataSourceEnabled: boolean) {

  const getConfigsQuerySchema: Schema = {
    from_index: schema.number(),
    max_items: schema.number(),
    query: schema.maybe(schema.string()),
    config_type: schema.oneOf([
      schema.arrayOf(schema.string()),
      schema.string(),
    ]),
    is_enabled: schema.maybe(schema.boolean()),
    sort_field: schema.string(),
    sort_order: schema.string(),
    config_id_list: schema.maybe(
      schema.oneOf([schema.arrayOf(schema.string()), schema.string()])
    ),
    'smtp_account.method': schema.maybe(
      schema.oneOf([schema.arrayOf(schema.string()), schema.string()])
    ),
  };

  if (dataSourceEnabled) {
    getConfigsQuerySchema.dataSourceId = schema.string();
  }

  const genericBodyAndDataSourceIdQuery: GenericQueryAndBody = {
    body: schema.any(),
  };

  if (dataSourceEnabled) {
    genericBodyAndDataSourceIdQuery.query = schema.object({
      dataSourceId: schema.string(),
    });
  }

  const genericParamsAndDataSourceIdQuery: GenericQueryAndBody = {
    params: schema.any(),
  };

  if (dataSourceEnabled) {
    genericParamsAndDataSourceIdQuery.query = schema.object({
      dataSourceId: schema.string(),
    });
  }

  const updateQuerySchema: UpdateQuerySchema = {
    body: schema.any(),
    params: schema.object({
      configId: schema.string(),
    }),
  };

  if (dataSourceEnabled) {
    updateQuerySchema.query = schema.object({
      dataSourceId: schema.string(),
    });
  }

  const deleteQuerySchema: DeleteQuerySchema = {
    config_id_list: schema.oneOf([
      schema.arrayOf(schema.string()),
      schema.string(),
    ]),
  };

  if (dataSourceEnabled) {
    deleteQuerySchema.dataSourceId = schema.string();
  }

  router.get(
    {
      path: NODE_API.GET_CONFIGS,
      validate: {
        query: schema.object(getConfigsQuerySchema),
      },
    },
    async (context, request, response) => {
      const config_type = joinRequestParams(request.query.config_type);
      const config_id_list = joinRequestParams(request.query.config_id_list);
      const encryption_method = joinRequestParams(
        request.query['smtp_account.method']
      );
      const query = request.query.query;

      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.getConfigs',
          {
            from_index: request.query.from_index,
            max_items: request.query.max_items,
            is_enabled: request.query.is_enabled,
            sort_field: request.query.sort_field,
            sort_order: request.query.sort_order,
            config_type,
            ...(query && { text_query: query }), // text_query will exclude keyword fields
            ...(config_id_list && { config_id_list }),
            ...(encryption_method && {
              'smtp_account.method': encryption_method,
            }),
          }
        );
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 400,
          body: error.message,
        });
      }
    }
  );

  router.get(
    {
      path: `${NODE_API.GET_CONFIG}/{configId}`,
      validate: genericParamsAndDataSourceIdQuery,
    },
    async (context, request, response) => {
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.getConfigById',
          { configId: request.params.configId }
        );
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  router.post(
    {
      path: NODE_API.CREATE_CONFIG,
      validate: genericBodyAndDataSourceIdQuery,
    },
    async (context, request, response) => {
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.createConfig',
          { body: request.body },
        );
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );


  router.put(
    {
      path: `${NODE_API.UPDATE_CONFIG}/{configId}`,
      validate: updateQuerySchema,
    },
    async (context, request, response) => {
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.updateConfigById',
          {
            configId: request.params.configId,
            body: request.body,
          }
        );
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  router.delete(
    {
      path: NODE_API.DELETE_CONFIGS,
      validate: {
        query: schema.object(deleteQuerySchema)
      }
    },
    async (context, request, response) => {
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled)
      const config_id_list = joinRequestParams(request.query.config_id_list);
      try {
        const resp = await client(
          'notifications.deleteConfigs',
          { config_id_list }
        );
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  router.get(
    {
      path: NODE_API.GET_AVAILABLE_FEATURES,
      validate: dataSourceEnabled ? {
        query: schema.object({
          dataSourceId: schema.string(),
        }),
      } : false,
    },
    async (context, request, response) => {
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);

      try {
        const resp = await client(
          'notifications.getServerFeatures'
        );
        const config_type_list = resp.allowed_config_type_list as Array<
          keyof typeof CHANNEL_TYPE
        >;
        const channelTypes: Partial<typeof CHANNEL_TYPE> = {};

        for (let channel of config_type_list) {
          if (CHANNEL_TYPE[channel]) {
            channelTypes[channel] = CHANNEL_TYPE[channel]
          }
        }

        const availableFeature = {
          availableChannels: channelTypes,
          availableConfigTypes: config_type_list as string[],
          tooltipSupport:
            _.get(response, ['plugin_features', 'tooltip_support']) === 'true',
        };
        return response.ok({ body: availableFeature });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 400,
          body: error.message,
        });
      }
    }
  );
}
