/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TopNavControlData,
  TopNavControlDescriptionData,
  TopNavControlLinkData,
} from '../../../../../src/plugins/navigation/public';
import { getApplication, getNavigationUI, getUseUpdatedUx } from '../../services/utils/constants';
import { useUpdateUrlWithDataSourceProperties } from '../MDSEnabledComponent/MDSEnabledComponent';

export interface PageHeaderProps {
  appRightControls?: TopNavControlData[];
  appBadgeControls?: TopNavControlData[];
  appDescriptionControls?: (TopNavControlDescriptionData | TopNavControlLinkData)[];
  appLeftControls?: TopNavControlData[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  appBadgeControls,
  appRightControls,
  appDescriptionControls,
  appLeftControls,
}) => {
  const { HeaderControl } = getNavigationUI();
  const { setAppBadgeControls, setAppRightControls, setAppDescriptionControls, setAppLeftControls } = getApplication();
  useUpdateUrlWithDataSourceProperties();

  return getUseUpdatedUx() ? (
    <>
      <HeaderControl setMountPoint={setAppBadgeControls} controls={appBadgeControls} />
      <HeaderControl setMountPoint={setAppRightControls} controls={appRightControls} />
      <HeaderControl setMountPoint={setAppDescriptionControls} controls={appDescriptionControls} />
      <HeaderControl setMountPoint={setAppLeftControls} controls={appLeftControls} />
    </>
  ) : (
    <>{children}</>
  );
};

export default PageHeader;