// eslint-disable-next-line @typescript-eslint/no-var-requires
const notificationsConfig = require('../common/notifications_configs.json');

const WS_ACL_ENDPOINT_PATTERNS: string[] = notificationsConfig['ws.acl.enforce.endpoint.patterns'] || [];

interface WorkspaceAuthorizer {
  authorizeWorkspace: (
    request: any,
    workspaceIds: string[],
    permissionModes?: string[]
  ) => Promise<{ authorized: true } | { authorized: false; unauthorizedWorkspaces: string[] }>;
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
      return context.notificationsContext.notificationsClient.asScoped(
        request,
      ).callAsCurrentUser;
    }
  }

  static async enforceWorkspaceAcl(request, context, response, dataSourceEnabled, permissionModes: string[] = ['read']) {
    const authorized = await MDSEnabledClientService.checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes);
    if (!authorized) {
      return response.unauthorized({ body: { message: 'Workspace ACL check failed: unauthorized' } });
    }
    return undefined;
  }

  static async checkWorkspaceAcl(request, context, dataSourceEnabled, permissionModes: string[] = ['read']): Promise<boolean> {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (!dataSourceEnabled || !dataSourceId || dataSourceId.trim().length === 0) {
      return true;
    }

    const savedObjectsClient = context.core.savedObjects.client;
    const dataSource = await savedObjectsClient.get('data-source', dataSourceId);
    const endpoint = (dataSource.attributes as any).endpoint as string;

    const requiresAcl = WS_ACL_ENDPOINT_PATTERNS.some((pattern) => endpoint.includes(pattern));
    if (!requiresAcl) {
      return true;
    }

    const workspaceId = workspaceIdGetter?.(request);

    if (!workspaceId || !workspaceStart) {
      return true;
    }

    const result = await workspaceStart.authorizeWorkspace(request, [workspaceId], permissionModes);
    logger?.debug(`Workspace ACL check: workspace=${workspaceId}, authorized=${result.authorized}, permissionModes=${permissionModes.join(',')}`);
    return result.authorized;
  }
}
