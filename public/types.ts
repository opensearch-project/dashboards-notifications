/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { ManagementOverViewPluginSetup } from "../../../src/plugins/management_overview/public";

export interface notificationsDashboardsPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface notificationsDashboardsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}

export interface NotificationsDashboardsSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
}
