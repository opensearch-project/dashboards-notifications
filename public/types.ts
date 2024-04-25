/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { ManagementOverViewPluginSetup } from "../../../src/plugins/management_overview/public";
import { DataSourcePluginStart } from "../../../src/plugins/data_source/public/types";
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';

export interface notificationsDashboardsPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface notificationsDashboardsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  dataSource?: DataSourcePluginStart;
}

export interface NotificationsDashboardsSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}
