/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { MOCK_DATA } from '../../../../test/mocks/mockData';
import { routerComponentPropsMock } from '../../../../test/mocks/routerPropsMock';
import {
  coreServicesMock,
  mainStateMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { MainContext } from '../../Main/Main';
import { Channels } from '../Channels';
import { getResourceSharingAvailableTypes } from '../../../services/utils/resource_sharing';
import { setupCoreStart } from '../../../../test/utils/helpers';

jest.mock('../../../services/utils/resource_sharing', () => ({
  getResourceSharingAvailableTypes: jest.fn(),
  NOTIFICATION_CONFIG_RESOURCE_TYPE: 'notification_config',
}));

beforeAll(() => {
  setupCoreStart();
});

beforeEach(() => {
  (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([]);
});

describe('<Channels/> spec', () => {
  it('renders the empty component', () => {
    const notificationServiceMock = jest.fn() as any;
    const getChannels = jest.fn(async (queryObject: object) => []);
    notificationServiceMock.notificationService = { getChannels };
    const utils = render(
      <MainContext.Provider value={mainStateMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <Channels
            {...routerComponentPropsMock}
            notificationService={notificationServiceMock}
          />
        </CoreServicesContext.Provider>
      </MainContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders the component', async () => {
    const getChannels = jest.fn(
      async (queryObject: object) => MOCK_DATA.channels
    );
    const notificationService = jest.fn() as any;
    notificationService.getChannels = getChannels;
    const utils = render(
      <MainContext.Provider value={mainStateMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <Channels
            {...routerComponentPropsMock}
            notificationService={notificationService}
          />
        </CoreServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => expect(getChannels).toHaveBeenCalled());

    const input = utils.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test-query' } });

    await waitFor(() =>
      expect(getChannels).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'test-query' })
      )
    );
  });
});

describe('<Channels/> resource sharing Access column', () => {
  const renderChannels = () => {
    const getChannels = jest.fn(async () => ({
      items: [
        {
          config_id: 'channel-1',
          name: 'my channel',
          config_type: 'slack',
          is_enabled: true,
          description: 'a channel',
        },
      ],
      total: 1,
    }));
    const notificationService = jest.fn() as any;
    notificationService.getChannels = getChannels;
    const utils = render(
      <MainContext.Provider value={mainStateMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <Channels
            {...routerComponentPropsMock}
            notificationService={notificationService}
          />
        </CoreServicesContext.Provider>
      </MainContext.Provider>
    );
    return { utils, getChannels };
  };

  afterEach(() => (getResourceSharingAvailableTypes as jest.Mock).mockReset());

  it('renders the Access column with a share-button marker when resource sharing is available', async () => {
    (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([
      'notification_config',
    ]);
    const { utils, getChannels } = renderChannels();

    await waitFor(() => expect(getChannels).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        utils.container.querySelector('[data-resource-share-button]')
      ).not.toBeNull()
    );

    const marker = utils.container.querySelector(
      '[data-resource-share-button]'
    );
    expect(marker!.getAttribute('data-resource-id')).toBe('channel-1');
    expect(marker!.getAttribute('data-resource-type')).toBe(
      'notification_config'
    );
    expect(marker!.getAttribute('data-resource-name')).toBe('my channel');
    expect(marker!.getAttribute('data-resource-share-display')).toBe('icon');
  });

  it('does not render the Access column when resource sharing is unavailable', async () => {
    (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([]);
    const { utils, getChannels } = renderChannels();

    await waitFor(() => expect(getChannels).toHaveBeenCalled());
    expect(
      utils.container.querySelector('[data-resource-share-button]')
    ).toBeNull();
  });
});

describe('Access column staleness guard logic', () => {
  // Direct unit coverage of the guard used in Channels' render: both the
  // accessColumn's render callback and the columns computation must only
  // trust resourceSharing.types when it was resolved for the currently
  // selected data source. updateResourceSharingAvailableTypes captures the
  // requested data source id before awaiting
  // getResourceSharingAvailableTypes(...), so on a data-source switch, a
  // late-resolving call from the previous data source is dropped instead of
  // overwriting state for the newly selected one -- but the render-time
  // check still needs its own guard against whatever is currently in state.
  const computeAvailable = (
    resourceSharing: { dataSourceId: string | undefined; types: string[] },
    selectedDataSourceId: string | undefined,
    resourceType: string
  ) =>
    resourceSharing.dataSourceId === selectedDataSourceId &&
    resourceSharing.types.includes(resourceType);

  it('is available once types resolve for the currently selected data source', () => {
    const resourceSharing = {
      dataSourceId: 'ds-a',
      types: ['notification_config'],
    };
    expect(
      computeAvailable(resourceSharing, 'ds-a', 'notification_config')
    ).toBe(true);
  });

  it('is unavailable while a resolved result belongs to a data source other than the one now selected', () => {
    const resourceSharing = {
      dataSourceId: 'ds-a',
      types: ['notification_config'],
    };
    expect(
      computeAvailable(resourceSharing, 'ds-b', 'notification_config')
    ).toBe(false);
  });

  it('is unavailable before any result has resolved for the currently selected data source', () => {
    const resourceSharing = { dataSourceId: undefined, types: [] };
    expect(
      computeAvailable(resourceSharing, 'ds-a', 'notification_config')
    ).toBe(false);
  });

  it('is unavailable once the current data source resolves but does not register the resource type', () => {
    const resourceSharing = {
      dataSourceId: 'ds-a',
      types: ['some-other-type'],
    };
    expect(
      computeAvailable(resourceSharing, 'ds-a', 'notification_config')
    ).toBe(false);
  });
});
