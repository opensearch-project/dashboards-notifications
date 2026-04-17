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
import { MDSEnabledClientService } from '../../common/MDSEnabledClientService';

export function eventRoutes(router: IRouter, dataSourceEnabled: boolean) {

  const enforceWorkspaceAcl = async (context, request, response, permissionModes: string[]) => {
    const authorized = await MDSEnabledClientService.checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes);
    if (!authorized) {
      return response.custom({ statusCode: 403, body: 'Workspace ACL check failed: unauthorized' });
    }
    return null;
  };

  let genericParamsAndDataSourceIdQuery: { params: any; query?: any } = {
    params: schema.any(),
  };
  if (dataSourceEnabled) {
    genericParamsAndDataSourceIdQuery = {
      ...genericParamsAndDataSourceIdQuery,
      query: schema.object({
        dataSourceId: schema.string(),
      }),
    };
  }
  router.get(
    {
      path: `${NODE_API.GET_EVENT}/{eventId}`,
      validate: genericParamsAndDataSourceIdQuery,
    },
    async (context, request, response) => {
      const aclResponse = await enforceWorkspaceAcl(context, request, response, ['library_write', 'library_read']);
      if (aclResponse) return aclResponse;
      // @ts-ignore
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.getEventById',
          { eventId: request.params.eventId }
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
      path: `${NODE_API.SEND_TEST_MESSAGE}/{configId}`,
      validate: genericParamsAndDataSourceIdQuery,
    },
    async (context, request, response) => {
      const aclResponse = await enforceWorkspaceAcl(context, request, response, ['library_write']);
      if (aclResponse) return aclResponse;
      // @ts-ignore
      const client = MDSEnabledClientService.getClient(request, context, dataSourceEnabled);
      try {
        const resp = await client(
          'notifications.sendTestMessage',
          {
            configId: request.params.configId,
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
}
