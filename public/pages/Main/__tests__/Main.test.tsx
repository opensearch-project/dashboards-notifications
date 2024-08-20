/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  HashRouter as Router,
  Route,
  RouteComponentProps,
} from 'react-router-dom';
import Main from '..';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { ROUTES } from '../../../utils/constants';
import httpClientMock from '../../../../test/mocks/httpClientMock';
import { setupCoreStart } from '../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<Main /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const mockProps = {
      location: { search: '', pathname: ROUTES.NOTIFICATIONS },
      match: { params: { id: 'test' } },
      http: httpClientMock, // Add the http prop here
    };
    const utils = render(
      <Router>
        <Route
          render={(props) => (
            <CoreServicesContext.Provider value={coreServicesMock}>
              <Main {...(mockProps as RouteComponentProps<{ id: string }>)} />
            </CoreServicesContext.Provider>
          )}
        />
      </Router>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
