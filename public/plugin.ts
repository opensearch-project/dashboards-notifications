/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  Plugin,
} from '../../../src/core/public';
import {
  notificationsDashboardsPluginSetup,
  notificationsDashboardsPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';
import {Navigation} from "./pages/Main/Main";
import {ROUTES} from "./utils/constants";
import {ManagementOverViewPluginSetup} from "../../../src/plugins/management_overview/public";

interface NotificationsDashboardsSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
}

export class notificationsDashboardsPlugin
  implements
    Plugin<
      notificationsDashboardsPluginSetup,
      notificationsDashboardsPluginStart
    > {
  public setup(core: CoreSetup, {managementOverview}: NotificationsDashboardsSetupDeps): notificationsDashboardsPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_NAME,
      title: 'Notifications',
      category: DEFAULT_APP_CATEGORIES.management,
      order: 9060,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, params);
      },
    });

    if (managementOverview) {
      managementOverview.register({
        id: PLUGIN_NAME,
        title: 'Notifications',
        order: 9060,
        pages: [
          {
            title: Navigation.Channels,
            url: `#${ROUTES.CHANNELS}`,
            order: 100
          },
          {
            title: Navigation.EmailSenders,
            url: `#${ROUTES.EMAIL_SENDERS}`,
            order: 200
          },
          {
            title: Navigation.EmailGroups,
            url: `#${ROUTES.EMAIL_GROUPS}`,
            order: 300
          },
        ]
      });
    }

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): notificationsDashboardsPluginStart {
    return {};
  }

  public stop() {}
}
