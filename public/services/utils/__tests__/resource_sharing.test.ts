/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../constants', () => ({
  getApplication: jest.fn(),
}));

import { isResourceSharingAvailable } from '../resource_sharing';
import { getApplication } from '../constants';

const mockGetApplication = getApplication as jest.Mock;

const withResourceSharing = (resourceSharing?: Record<string, unknown>) =>
  mockGetApplication.mockReturnValue({
    capabilities: resourceSharing ? { resourceSharing } : {},
  });

describe('isResourceSharingAvailable', () => {
  afterEach(() => mockGetApplication.mockReset());

  it('returns false when the resourceSharing capability is absent', () => {
    withResourceSharing();
    expect(isResourceSharingAvailable()).toBe(false);
  });

  it('returns false when resource sharing is disabled', () => {
    withResourceSharing({
      enabled: false,
      availableTypes: 'notification_config',
    });
    expect(isResourceSharingAvailable()).toBe(false);
  });

  it('returns false when notification_config is not in availableTypes', () => {
    withResourceSharing({
      enabled: true,
      availableTypes: 'workflow,anomaly-detector',
    });
    expect(isResourceSharingAvailable()).toBe(false);
  });

  it('returns true when enabled and notification_config is present', () => {
    withResourceSharing({
      enabled: true,
      availableTypes: 'workflow,notification_config',
    });
    expect(isResourceSharingAvailable()).toBe(true);
  });

  it('returns false and swallows errors when getApplication throws', () => {
    mockGetApplication.mockImplementation(() => {
      throw new Error('application not ready');
    });
    expect(isResourceSharingAvailable()).toBe(false);
  });
});
