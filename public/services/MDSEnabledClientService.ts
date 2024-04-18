
export class MDSEnabledClientService {
  static getClient(request, context, dataSourceEnabled) {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
      console.log('DataSourceId is from getClient', dataSourceId);
      return context.dataSource.opensearch.legacy.getClient(dataSourceId.toString()).callAPI;
    } else {
      // fall back to default local cluster
      return context.notificationsContext.notificationsClient.asScoped(
        request,
      ).callAsCurrentUser;
    }
  }
}

