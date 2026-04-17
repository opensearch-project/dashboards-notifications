import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
  ILegacyClusterClient,
} from "../../../src/core/server";

import {
  notificationsDashboardsPluginSetup,
  notificationsDashboardsPluginStart,
} from "./types";
import { defineRoutes } from "./routes";
import { NotificationsPlugin } from "./clusters/notificationsPlugin";
import { DataSourcePluginSetup } from "../../../src/plugins/data_source/server";
import { MDSEnabledClientService } from "../common/MDSEnabledClientService";

export interface NotificationsDashboardsPluginDependencies {
  dataSource: DataSourcePluginSetup;
}

export class notificationsDashboardsPlugin
  implements
    Plugin<
      notificationsDashboardsPluginSetup,
      notificationsDashboardsPluginStart
    > {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup, { dataSource }: NotificationsDashboardsPluginDependencies) {
    this.logger.debug("notificationsDashboards: Setup");
    const router = core.http.createRouter();

    const notificationsClient: ILegacyClusterClient = core.opensearch.legacy.createClient(
      'opensearch_notifications',
      {
        plugins: [NotificationsPlugin],
      }
    );

    const dataSourceEnabled = !!dataSource;

    if (dataSourceEnabled) {
      dataSource.registerCustomApiSchema(NotificationsPlugin);
    }

    core.http.registerRouteHandlerContext('notificationsContext', (context, request) => {
      return {
        logger: this.logger,
        notificationsClient,
      };
    });

    // Register server side APIs
    defineRoutes(router, dataSourceEnabled);

    return {};
  }

  public start(core: CoreStart, plugins?: any) {
    this.logger.debug("notificationsDashboards: Started");
    MDSEnabledClientService.setLogger(this.logger);
    if (plugins?.workspace) {
      MDSEnabledClientService.setWorkspaceStart(plugins.workspace);
      try {
        const { getWorkspaceState } = require('../../../src/core/server/utils');
        MDSEnabledClientService.setWorkspaceIdGetter((request) => {
          try { return getWorkspaceState(request).requestWorkspaceId; } catch (e) { return undefined; }
        });
      } catch (e) {
        this.logger.warn('Failed to load getWorkspaceState, workspace ACL will skip workspace ID resolution');
      }
    }
    return {};
  }

  public stop() {}
}
