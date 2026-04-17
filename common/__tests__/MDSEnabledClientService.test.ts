/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MDSEnabledClientService } from '../MDSEnabledClientService';
import { getWorkspaceState } from '../../../src/core/server/utils';

const mockGetWorkspaceState = getWorkspaceState as jest.Mock;

const createMockRequest = (overrides: any = {}) => ({
  query: { dataSourceId: 'ds-1', ...overrides.query },
  headers: {
    'x-amzn-aosd-username': 'arn:aws:sts::123456:assumed-role/Admin/user1',
    ...overrides.headers,
  },
});

const createMockContext = (endpoint = 'https://col.us-west-2.aoss.amazonaws.com') => ({
  core: {
    savedObjects: {
      client: {
        get: jest.fn().mockResolvedValue({
          attributes: { endpoint },
        }),
      },
    },
  },
});

describe('MDSEnabledClientService - checkWorkspaceAcl', () => {
  const mockAuthorizeWorkspace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceState.mockReturnValue({ requestWorkspaceId: 'ws-1' });
    mockAuthorizeWorkspace.mockResolvedValue({ authorized: true });
    MDSEnabledClientService.setWorkspaceStart({ authorizeWorkspace: mockAuthorizeWorkspace });
    MDSEnabledClientService.setLogger({ info: jest.fn() });
  });

  it('should skip ACL check when no dataSourceId', async () => {
    const request = createMockRequest({ query: { dataSourceId: '' } });
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, {}, true, ['read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
  });

  it('should skip ACL check when dataSourceEnabled is false', async () => {
    const request = createMockRequest();
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, {}, false, ['read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
  });

  it('should skip ACL check for non-AOSS (managed domain) endpoints', async () => {
    const request = createMockRequest();
    const context = createMockContext('https://search-domain.us-west-2.es.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
  });

  it('should run ACL check for AOSS endpoints and return true when authorized', async () => {
    const request = createMockRequest();
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).toHaveBeenCalledWith(
      request, ['ws-1'], 'arn:aws:sts::123456:assumed-role/Admin/user1', ['library_read']
    );
  });

  it('should return false when workspace authorization fails for AOSS', async () => {
    mockAuthorizeWorkspace.mockResolvedValue({ authorized: false });
    const request = createMockRequest();
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_write']);
    expect(result).toBe(false);
  });

  it('should skip ACL check when no principal header', async () => {
    const request = createMockRequest({ headers: { 'x-amzn-aosd-username': undefined } });
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
  });

  it('should skip ACL check when no workspace ID in request', async () => {
    mockGetWorkspaceState.mockReturnValue({ requestWorkspaceId: undefined });
    const request = createMockRequest();
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
    expect(result).toBe(true);
    expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
  });

  it('should skip ACL check when workspaceStart is not set', async () => {
    MDSEnabledClientService.setWorkspaceStart(undefined as any);
    const request = createMockRequest();
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
    expect(result).toBe(true);
  });

  it('should pass correct permission modes to authorizeWorkspace', async () => {
    const request = createMockRequest();
    const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
    await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_write', 'library_read']);
    expect(mockAuthorizeWorkspace).toHaveBeenCalledWith(
      request, ['ws-1'], 'arn:aws:sts::123456:assumed-role/Admin/user1', ['library_write', 'library_read']
    );
  });
});
