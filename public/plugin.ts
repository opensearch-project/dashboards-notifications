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
  DEFAULT_NAV_GROUPS,
  Plugin,
  WorkspaceAvailability
} from '../../../src/core/public';
import {
  notificationsDashboardsPluginSetup,
  notificationsDashboardsPluginStart,
  NotificationsDashboardsSetupDeps,
} from './types';
import { PLUGIN_NAME } from '../common';
import { ROUTES } from './utils/constants';

export class notificationsDashboardsPlugin
  implements
  Plugin<
    notificationsDashboardsPluginSetup,
    notificationsDashboardsPluginStart
  > {
  private title = i18n.translate('notification.notificationTitle', {
    defaultMessage: 'Notifications',
  });

  public setup(
    core: CoreSetup,
    { managementOverview, dataSourceManagement }: NotificationsDashboardsSetupDeps,
  ): notificationsDashboardsPluginSetup {

    const mountWrapper = async (params: AppMountParameters, redirect: string) => {
      const { renderApp } = await import("./application");
      const [coreStart, depsStart] = await core.getStartServices();
      return renderApp(coreStart, params, dataSourceManagement!, depsStart, redirect);
    };

    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_NAME,
      title: this.title,
      category: DEFAULT_APP_CATEGORIES.management,
      order: 9060,
      workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, params, dataSourceManagement!, depsStart, ROUTES.CHANNELS);
      },
    });

    if (managementOverview) {
      managementOverview.register({
        id: PLUGIN_NAME,
        title: this.title,
        order: 9060,
        description: i18n.translate('notification.notificationDescription', {
          defaultMessage:
            'Connect with your communication services to receive notifications from supported OpenSearch plugins.',
        }),
      });
    }

    // register applications with category and use case information
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.observability, [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: false
      }
    ])
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS['security-analytics'], [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: false
      }
    ])
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.analytics, [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: false
      }
    ])
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.settingsAndSetup, [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: true
      }
    ])
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.search, [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: false
      }
    ])
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.dataAdministration, [
      {
        id: PLUGIN_NAME,
        showInAllNavGroup: false
      }
    ])

    if (core.chrome.navGroup.getNavGroupEnabled()) {
      // channels route
      core.application.register({
        id: `channels`,
        title: 'Channels',
        order: 9070,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.CHANNELS);
        },
      });

      core.application.register({
        id: `email_senders`,
        title: 'Email senders',
        order: 9080,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.EMAIL_SENDERS);
        },
      });

      core.application.register({
        id: `email_groups`,
        title: 'Email recepient groups',
        order: 9090,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.EMAIL_GROUPS);
        },
      });

      const navLinks = [
        {
          id: `channels`,
          parentNavLinkId: PLUGIN_NAME
        },
        {
          id: `email_senders`,
          parentNavLinkId: PLUGIN_NAME
        },
        {
          id: `email_groups`,
          parentNavLinkId: PLUGIN_NAME
        },
      ];
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS.settingsAndSetup,
        navLinks
      );
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS.search,
        navLinks
      );
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS['security-analytics'],
        navLinks
      );
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS.analytics,
        navLinks
      );
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS.dataAdministration,
        navLinks
      );
      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS.observability,
        navLinks
      );
    }

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): notificationsDashboardsPluginStart {
    return {};
  }

  public stop() { }
}
