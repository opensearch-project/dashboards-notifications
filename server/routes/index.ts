/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { MDSEnabledClientService } from '../MDSEnabledClientService';
import { configRoutes } from './configRoutes';
import { eventRoutes } from './eventRoutes';

export function defineRoutes(router: IRouter, dataSourceEnabled: boolean, service: MDSEnabledClientService) {
  configRoutes(router, dataSourceEnabled, service);
  eventRoutes(router, dataSourceEnabled, service);
}
