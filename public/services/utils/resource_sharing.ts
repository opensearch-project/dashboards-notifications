/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getApplication } from './constants';

/**
 * Resource type registered by the notifications backend plugin with the
 * security plugin's resource-sharing framework (NotificationsResourceSharingExtension).
 */
export const NOTIFICATION_CONFIG_RESOURCE_TYPE = 'notification_config';

/**
 * Whether resource sharing is available for notification configs, via the
 * core capability registered by security-dashboards-plugin. False when that
 * plugin is not installed, the feature is disabled, or the
 * notification_config type is not registered — no plugin dependency involved.
 */
export function isResourceSharingAvailable(): boolean {
  try {
    const caps = (getApplication().capabilities as any)?.resourceSharing;
    if (!caps?.enabled) return false;
    const types: string = caps.availableTypes ?? '';
    return types.split(',').includes(NOTIFICATION_CONFIG_RESOURCE_TYPE);
  } catch (e) {
    return false;
  }
}
