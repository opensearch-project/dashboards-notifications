/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { EmailGroups } from '../EmailGroups';
import { setupCoreStart } from '../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<EmailGroups/> spec', () => {
  it('renders the component', () => {
    const routerComponentPropsMock = {
      // Mock other props as needed
      notificationService: notificationServiceMock,
    };

    const utils = render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <EmailGroups {...routerComponentPropsMock} />
        </CoreServicesContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
