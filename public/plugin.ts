/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
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
  NotificationsDashboardsSetupDeps,
} from './types';
import { PLUGIN_NAME } from '../common';
import { AppPluginStartDependencies } from './types';

export class notificationsDashboardsPlugin
  implements
    Plugin<
      notificationsDashboardsPluginSetup,
      notificationsDashboardsPluginStart
    > {
      private title = i18n.translate('notification.notificationCore.Title', {
        defaultMessage: 'Notifications',
  });

  public setup(
    core: CoreSetup,
    { managementOverview, dataSourceManagement }: NotificationsDashboardsSetupDeps,
  ): notificationsDashboardsPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_NAME,
      title: this.title,
      category: DEFAULT_APP_CATEGORIES.management,
      order: 9060,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, params, dataSourceManagement, depsStart);
      },
    });

    if (managementOverview) {
      managementOverview.register({
        id: PLUGIN_NAME,
        title: this.title,
        order: 9060,
        description: i18n.translate('notification.notificationCore.Description', {
          defaultMessage:
            'Connect with your communication services to receive notifications from supported OpenSearch plugins.',
        }),
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
