/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../constants', () => ({
  getHttp: jest.fn(),
}));

import { getResourceSharingAvailableTypes } from '../resource_sharing';
import { getHttp } from '../constants';

const mockGetHttp = getHttp as jest.Mock;

const withHttpResponses = (dashboardsInfo: unknown, types?: unknown) => {
  const get = jest.fn(async (path: string) => {
    if (path === '/api/v1/auth/dashboardsinfo') return dashboardsInfo;
    if (path === '/api/resource/types') return types;
    throw new Error(`unexpected path: ${path}`);
  });
  mockGetHttp.mockReturnValue({ get });
  return get;
};

describe('getResourceSharingAvailableTypes', () => {
  afterEach(() => mockGetHttp.mockReset());

  it('returns [] when resource sharing is disabled on the data source', async () => {
    withHttpResponses({ resource_sharing_enabled: false });
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([]);
  });

  it('returns the registered types when resource sharing is enabled', async () => {
    withHttpResponses(
      { resource_sharing_enabled: true },
      { types: [{ type: 'workflow' }, { type: 'notification_config' }] }
    );
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([
      'workflow',
      'notification_config',
    ]);
  });

  it('supports bare-array responses and filters malformed entries', async () => {
    withHttpResponses({ resource_sharing_enabled: true }, [
      { type: 'notification_config' },
      {},
      null,
    ]);
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([
      'notification_config',
    ]);
  });

  it('passes the data source id as a query parameter to both routes', async () => {
    const get = withHttpResponses(
      { resource_sharing_enabled: true },
      { types: [] }
    );
    await getResourceSharingAvailableTypes('ds-1');
    expect(get).toHaveBeenCalledWith('/api/v1/auth/dashboardsinfo', {
      query: { dataSourceId: 'ds-1' },
    });
    expect(get).toHaveBeenCalledWith('/api/resource/types', {
      query: { dataSourceId: 'ds-1' },
    });
  });

  it('returns [] and swallows errors when the http client throws', async () => {
    mockGetHttp.mockImplementation(() => {
      throw new Error('http not ready');
    });
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([]);
  });
});
