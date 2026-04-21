import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
  ILegacyClusterClient,
} from "../../../src/core/server";
import { getWorkspaceState } from "../../../src/core/server/utils";

import {
  notificationsDashboardsPluginSetup,
  notificationsDashboardsPluginStart,
} from "./types";
import { defineRoutes } from "./routes";
import { NotificationsPlugin } from "./clusters/notificationsPlugin";
import { DataSourcePluginSetup } from "../../../src/plugins/data_source/server";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export interface NotificationsDashboardsPluginDependencies {
  dataSource: DataSourcePluginSetup;
}

export interface NotificationsDashboardsPluginStartDependencies {
  workspace?: {
    authorizeWorkspace: (
      request: any,
      workspaceIds: string[],
      permissionModes?: string[]
    ) => Promise<any>;
    aclEnforceEndpointPatterns: string[];
  };
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

  public start(core: CoreStart, plugins?: NotificationsDashboardsPluginStartDependencies) {
    this.logger.debug("notificationsDashboards: Started");
    MDSEnabledClientService.setLogger(this.logger);
    if (plugins?.workspace) {
      MDSEnabledClientService.setWorkspaceStart(plugins.workspace);
      MDSEnabledClientService.setWorkspaceIdGetter((request) => {
        try {
          return getWorkspaceState(request).requestWorkspaceId;
        } catch (e) {
          return undefined;
        }
      });
    }
    return {};
  }

  public stop() {}
}
