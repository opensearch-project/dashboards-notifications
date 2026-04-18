/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../../common/notifications_configs.json', () => ({
  'ws.acl.enforce.endpoint.patterns': ['.aoss.amazonaws.com'],
}), { virtual: true });

import { MDSEnabledClientService } from '../../server/MDSEnabledClientService';

const createMockRequest = (overrides: any = {}) => ({
  query: { dataSourceId: 'ds-1', ...overrides.query },
  headers: overrides.headers || {},
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

const createMockResponse = () => ({
  ok: jest.fn((payload) => payload),
  unauthorized: jest.fn((payload) => ({ unauthorized: true, ...payload })),
});

describe('MDSEnabledClientService - Workspace ACL', () => {
  const mockAuthorizeWorkspace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthorizeWorkspace.mockResolvedValue({ authorized: true });
    MDSEnabledClientService.setWorkspaceStart({ authorizeWorkspace: mockAuthorizeWorkspace });
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
      expect(mockAuthorizeWorkspace).toHaveBeenCalledWith(request, ['ws-1'], ['library_read']);
    });

    it('should return false when workspace authorization fails for AOSS', async () => {
      mockAuthorizeWorkspace.mockResolvedValue({ authorized: false });
      const request = createMockRequest();
      const context = createMockContext('https://col.us-west-2.aoss.amazonaws.com');
      const result = await MDSEnabledClientService.checkWorkspaceAcl(request, context, true, ['library_write']);
      expect(result).toBe(false);
    });

    it('should skip ACL check when no workspace ID in request', async () => {
      MDSEnabledClientService.setWorkspaceIdGetter(() => undefined);
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
  });
});
