/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-subj' });

window.URL.createObjectURL = () => '';
window.scrollTo = jest.fn();

const moment = jest.requireActual('moment-timezone');
jest.doMock('moment', () => {
  moment.tz.setDefault('Etc/UTC');
  return moment;
});

jest.mock('@elastic/eui/lib/components/form/form_row/make_id', () => () => 'random-id');

jest.mock('@elastic/eui/lib/services/accessibility/html_id_generator', () => ({
  htmlIdGenerator: () => {
    return () => 'random_html_id';
  },
}));

// jest-location-mock uses process.env.HOST as the base URL for its window.location mock.
// Set it to match testEnvironmentOptions.url so window.location.origin is 'http://localhost:5601'
// in all jsdom tests, consistent with the rest of the suite.
process.env.HOST = 'http://localhost:5601';

// jsdom 26 marks window.localStorage and window.sessionStorage as non-configurable.
// Re-declare them as configurable once here so individual tests can override them
// with Object.defineProperty without hitting "Cannot redefine property" errors.
['localStorage', 'sessionStorage'].forEach((key) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, key, {
      configurable: true,
      writable: true,
      value: descriptor.value,
    });
  }
});
