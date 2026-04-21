/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MDSEnabledClientService } from '../../server/MDSEnabledClientService';

const ACL_ENFORCED_ENDPOINT = 'https://collection.example.acl-enforced.com';
const NON_ACL_ENDPOINT = 'https://search-domain.example.com';
const ACL_PATTERN = '.acl-enforced.com';

const createMockRequest = (overrides: any = {}) => ({
  query: { dataSourceId: 'ds-1', ...overrides.query },
  headers: overrides.headers || {},
});

const createMockContext = (endpoint = ACL_ENFORCED_ENDPOINT) => ({
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

const createMockResponse = () => ({
  ok: jest.fn((payload) => payload),
  unauthorized: jest.fn((payload) => ({ unauthorized: true, ...payload })),
  badRequest: jest.fn((payload) => ({ badRequest: true, ...payload })),
  notFound: jest.fn((payload) => ({ notFound: true, ...payload })),
});

describe('MDSEnabledClientService - Workspace ACL', () => {
  const mockAuthorizeWorkspace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthorizeWorkspace.mockResolvedValue({ authorized: true });
    MDSEnabledClientService.setWorkspaceStart({
      authorizeWorkspace: mockAuthorizeWorkspace,
      aclEnforceEndpointPatterns: [ACL_PATTERN],
    });
    MDSEnabledClientService.setWorkspaceIdGetter(() => 'ws-1');
    MDSEnabledClientService.setLogger({ debug: jest.fn() });
  });

  describe('checkWorkspaceAcl', () => {
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

    it('should skip ACL check for endpoints not matching configured patterns', async () => {
      const request = createMockRequest();
      const context = createMockContext(NON_ACL_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
      expect(result).toBe(true);
      expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
    });

    it('should run ACL check for matching endpoints and return true when authorized', async () => {
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_read']);
      expect(result).toBe(true);
      expect(mockAuthorizeWorkspace).toHaveBeenCalledWith(request, ['ws-1'], ['library_read']);
    });

    it('should return false when workspace authorization fails', async () => {
      mockAuthorizeWorkspace.mockResolvedValue({ authorized: false });
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_write']);
      expect(result).toBe(false);
    });

    it('should return no-workspace-id when no workspace ID in request', async () => {
      MDSEnabledClientService.setWorkspaceIdGetter(() => undefined);
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
      expect(result).toBe('no-workspace-id');
      expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
    });

    it('should return workspace-not-enabled when workspaceStart is not set', async () => {
      (MDSEnabledClientService as any).workspaceStart = undefined;
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
      expect(result).toBe('workspace-not-enabled');
    });

    it('should skip ACL check when aclEnforceEndpointPatterns is empty', async () => {
      MDSEnabledClientService.setWorkspaceStart({
        authorizeWorkspace: mockAuthorizeWorkspace,
        aclEnforceEndpointPatterns: [],
      });
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['read']);
      expect(result).toBe(true);
      expect(mockAuthorizeWorkspace).not.toHaveBeenCalled();
    });

    it('should pass correct permission modes to authorizeWorkspace', async () => {
      const request = createMockRequest();
      const context = createMockContext(ACL_ENFORCED_ENDPOINT);
      await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_write', 'library_read']);
      expect(mockAuthorizeWorkspace).toHaveBeenCalledWith(request, ['ws-1'], ['library_write', 'library_read']);
    });
  });

  describe('enforceWorkspaceAcl', () => {
    it('should return undefined when authorized', async () => {
      const request = createMockRequest();
      const context = createMockContext();
      const response = createMockResponse();
      const result = await MDSEnabledClientService.enforceWorkspaceAcl(request, context, response, true, ['read']);
      expect(result).toBeUndefined();
      expect(response.unauthorized).not.toHaveBeenCalled();
    });

    it('should return unauthorized response when not authorized', async () => {
      mockAuthorizeWorkspace.mockResolvedValue({ authorized: false });
      const request = createMockRequest();
      const context = createMockContext();
      const response = createMockResponse();
      await MDSEnabledClientService.enforceWorkspaceAcl(request, context, response, true, ['library_write']);
      expect(response.unauthorized).toHaveBeenCalledWith({
        body: { message: 'Workspace ACL check failed: unauthorized' },
      });
    });

    it('should return 400 when workspace ID is missing', async () => {
      MDSEnabledClientService.setWorkspaceIdGetter(() => undefined);
      const request = createMockRequest();
      const context = createMockContext();
      const response = createMockResponse();
      await MDSEnabledClientService.enforceWorkspaceAcl(request, context, response, true, ['read']);
      expect(response.badRequest).toHaveBeenCalledWith({
        body: { message: 'Workspace ID is required for this data source' },
      });
    });

    it('should return 404 when workspace plugin is not enabled', async () => {
      (MDSEnabledClientService as any).workspaceStart = undefined;
      const request = createMockRequest();
      const context = createMockContext();
      const response = createMockResponse();
      await MDSEnabledClientService.enforceWorkspaceAcl(request, context, response, true, ['read']);
      expect(response.notFound).toHaveBeenCalledWith({
        body: { message: 'Workspace plugin is not enabled' },
      });
    });
  });
});
