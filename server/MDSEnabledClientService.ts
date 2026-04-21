interface WorkspaceAuthorizer {
  authorizeWorkspace: (
    request: any,
    workspaceIds: string[],
    permissionModes?: string[]
  ) => Promise<{ authorized: true } | { authorized: false; unauthorizedWorkspaces: string[] }>;
  aclEnforceEndpointPatterns: string[];
}

export class MDSEnabledClientService {
  private static workspaceStart: WorkspaceAuthorizer | undefined;
  private static logger: any;
  private static workspaceIdGetter: ((request: any) => string | undefined) | undefined;
  private static aclEndpointPatterns: string[] = [];

  static setWorkspaceStart(ws: WorkspaceAuthorizer) {
    MDSEnabledClientService.workspaceStart = ws;
    MDSEnabledClientService.aclEndpointPatterns = ws?.aclEnforceEndpointPatterns ?? [];
  }

  static setLogger(l: any) {
    MDSEnabledClientService.logger = l;
  }

  static setWorkspaceIdGetter(fn: (request: any) => string | undefined) {
    MDSEnabledClientService.workspaceIdGetter = fn;
  }

  static getClient(request, context, dataSourceEnabled) {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
      return context.dataSource.opensearch.legacy.getClient(dataSourceId.toString()).callAPI;
    } else {
      return context.notificationsContext.notificationsClient.asScoped(
        request,
      ).callAsCurrentUser;
    }
  }

  static async enforceWorkspaceAcl(request, context, response, dataSourceEnabled, permissionModes: string[] = ['read']) {
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes);
    if (result === true) return undefined;
    if (result === 'no-workspace-id') {
      return response.badRequest({ body: { message: 'Workspace ID is required for this data source' } });
    }
    if (result === 'workspace-not-enabled') {
      return response.notFound({ body: { message: 'Workspace plugin is not enabled' } });
    }
    // result === false — unauthorized
    return response.unauthorized({ body: { message: 'Workspace ACL check failed: unauthorized' } });
  }

  static async checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes: string[] = ['read']): Promise<true | false | 'no-workspace-id' | 'workspace-not-enabled'> {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (!dataSourceEnabled || !dataSourceId || dataSourceId.trim().length === 0) {
      return true;
    }

    const savedObjectsClient = context.core.savedObjects.client;
    const dataSource = await savedObjectsClient.get('data-source', dataSourceId);
    const endpoint = (dataSource.attributes as any).endpoint as string;

    const requiresAcl = MDSEnabledClientService.aclEndpointPatterns.some((pattern) => endpoint.includes(pattern));
    if (!requiresAcl) {
      return true;
    }

    if (!MDSEnabledClientService.workspaceStart) {
      return 'workspace-not-enabled';
    }

    const workspaceId = MDSEnabledClientService.workspaceIdGetter?.(request);
    if (!workspaceId) {
      return 'no-workspace-id';
    }

    const result = await MDSEnabledClientService.workspaceStart.authorizeWorkspace(request, [workspaceId], permissionModes);
    MDSEnabledClientService.logger?.debug(`Workspace ACL check: workspace=${workspaceId}, authorized=${result.authorized}, permissionModes=${permissionModes.join(',')}`);
    return result.authorized;
  }
}
