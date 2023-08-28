/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { MicrosoftTeamsSettings } from '../components/MicrosoftTeamsSettings';
import { CreateChannelContext } from '../CreateChannel';

describe('<MicrosoftTeamsSettings /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const setMicrosoftTeamsWebhook = jest.fn();
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { microsoftTeamsWebhook: [] },
          setInputErrors: jest.fn(),
        }}
      >
        <MicrosoftTeamsSettings
          microsoftTeamsWebhook="test webhook"
          setMicrosoftTeamsWebhook={setMicrosoftTeamsWebhook}
        />
      </CreateChannelContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders the component with error', () => {
    const setMicrosoftTeamsWebhook = jest.fn();
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { microsoftTeamsWebhook: ['test error'] },
          setInputErrors: jest.fn(),
        }}
      >
        <MicrosoftTeamsSettings
          microsoftTeamsWebhook="test webhook"
          setMicrosoftTeamsWebhook={setMicrosoftTeamsWebhook}
        />
      </CreateChannelContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('changes input', () => {
    const setMicrosoftTeamsWebhook = jest.fn();
    const setInputErrors = jest.fn();
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { microsoftTeamsWebhook: [] },
          setInputErrors,
        }}
      >
        <MicrosoftTeamsSettings
          microsoftTeamsWebhook="test webhook"
          setMicrosoftTeamsWebhook={setMicrosoftTeamsWebhook}
        />
      </CreateChannelContext.Provider>
    );
    const input = utils.getByLabelText('Webhook URL');
    fireEvent.change(input, { target: { value: 'https://test-microsoftTeams-url' } });
    fireEvent.blur(input);
    expect(setMicrosoftTeamsWebhook).toBeCalledWith('https://test-microsoftTeams-url');
    expect(setInputErrors).toBeCalled();
  });
});
