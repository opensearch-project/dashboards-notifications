/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import { createGetterSetter } from '../../../../../src/plugins/opensearch_dashboards_utils/common';
import { CoreStart, IUiSettingsClient } from 'opensearch-dashboards/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';


export const [getUISettings, setUISettings] = createGetterSetter<IUiSettingsClient>('UISettings');

export const getUseUpdatedUx = () => {
  return getUISettings().get('home:useNewHomePage', false);
};

export const [getNavigationUI, setNavigationUI] = createGetterSetter<
  NavigationPublicPluginStart['ui']
>('navigation');

export const [getApplication, setApplication] = createGetterSetter<CoreStart['application']>(
  'application'
);

export const [getBreadCrumbsSetter, setBreadCrumbsSetter] = createGetterSetter<
  CoreStart['chrome']['setBreadcrumbs']
>('breadCrumbSetter');