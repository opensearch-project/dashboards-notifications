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

  public start(core: CoreStart) {
    this.logger.debug("notificationsDashboards: Started");
    return {};
  }

  public stop() {}
}
