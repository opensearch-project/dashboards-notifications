/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiText } from '@elastic/eui';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../components/coreServices';
import { BREADCRUMBS, setBreadcrumbs } from '../../utils/constants';
import { MainContext } from '../Main/Main';
import { SendersTable } from './components/tables/SendersTable';
import { SESSendersTable } from './components/tables/SESSendersTable';
import { NotificationService } from '../../services';
import { getUseUpdatedUx } from '../../services/utils/constants';
import { useUpdateUrlWithDataSourceProperties } from '../../components/MDSEnabledComponent/MDSEnabledComponent';

interface EmailSendersProps extends RouteComponentProps {
  notificationService: NotificationService;
}

export function EmailSenders(props: EmailSendersProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const mainStateContext = useContext(MainContext)!;

  // Call the hook to manage URL updates
  useUpdateUrlWithDataSourceProperties();

  useEffect(() => {
    setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.EMAIL_SENDERS,
    ]);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {!getUseUpdatedUx() && (
        <>
          <EuiText size="s">
            <h1>Email senders</h1>
          </EuiText>
          <EuiSpacer />
        </>
      )}
      {mainStateContext.availableConfigTypes.includes('smtp_account') && (
        <>
          <SendersTable coreContext={coreContext}
            notificationService={props.notificationService}
          />
        </>
      )}

      {/* UI currently does not fully handle this condition, adding it just to avoid flashing */}
      {mainStateContext.availableConfigTypes.includes('ses_account') && (
        <>
          <EuiSpacer />
          <SESSendersTable coreContext={coreContext}
            notificationService={props.notificationService}
          />
        </>
      )}
    </>
  );
}
