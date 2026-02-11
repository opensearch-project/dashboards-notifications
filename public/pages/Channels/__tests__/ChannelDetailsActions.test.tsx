/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import React from 'react';
import { MOCK_DATA } from '../../../../test/mocks/mockData';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { ServicesContext } from '../../../services';
import { ChannelDetailsActions } from '../components/details/ChannelDetailsActions';
import { setupCoreStart } from '../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<ChannelDetailsActions /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('opens popover', async () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('clicks buttons in popover', async () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    await waitFor(() => expect(utils.getByText('Edit')).toBeTruthy());
    await act(async () => fireEvent.click(utils.getByText('Edit')));
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    await waitFor(() => expect(utils.getByText('Send test message')).toBeTruthy());
    await act(async () => fireEvent.click(utils.getByText('Send test message')));
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    await waitFor(() => expect(utils.getByText('Delete')).toBeTruthy());
    await act(async () => fireEvent.click(utils.getByText('Delete')));
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
