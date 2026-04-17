interface WorkspaceAuthorizer {
  authorizeWorkspace: (
    request: any,
    workspaceIds: string[],
    principal: string,
    permissionModes?: string[]
  ) => Promise<{ authorized: boolean; unauthorizedWorkspaces?: string[] }>;
}

let workspaceStart: WorkspaceAuthorizer | undefined;
let logger: any;
let workspaceIdGetter: ((request: any) => string | undefined) | undefined;

export class MDSEnabledClientService {
  static setWorkspaceStart(ws: WorkspaceAuthorizer) {
    workspaceStart = ws;
  }

  static setLogger(l: any) {
    logger = l;
  }

  static setWorkspaceIdGetter(fn: (request: any) => string | undefined) {
    workspaceIdGetter = fn;
  }

  static getClient(request, context, dataSourceEnabled) {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
      return context.dataSource.opensearch.legacy.getClient(dataSourceId.toString()).callAPI;
    } else {
      // fall back to default local cluster
      return context.notificationsContext.notificationsClient.asScoped(
        request,
      ).callAsCurrentUser;
    }
  }

  static async checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes: string[] = ['read']): Promise<boolean> {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
      const savedObjectsClient = context.core.savedObjects.client;
      const dataSource = await savedObjectsClient.get('data-source', dataSourceId);
      const endpoint = (dataSource.attributes as any).endpoint as string;
      if (endpoint.indexOf('.aoss.amazonaws.com') === -1) {
        return true;
      }
    } else {
      return true;
    }

    const principal = request.headers['x-amzn-aosd-username'] as string;
    const workspaceId = workspaceIdGetter?.(request);

    if (!principal || !workspaceId || !workspaceStart) {
      return true;
    }

    const result = await workspaceStart.authorizeWorkspace(request, [workspaceId], principal, permissionModes);
    logger?.info(`Workspace ACL check: workspace=${workspaceId}, authorized=${result.authorized}, permissionModes=${permissionModes.join(',')}`);
    return result.authorized;
  }
}

