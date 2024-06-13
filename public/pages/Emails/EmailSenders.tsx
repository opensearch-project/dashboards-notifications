/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiTitle } from '@elastic/eui';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../components/coreServices';
import { BREADCRUMBS } from '../../utils/constants';
import { MainContext } from '../Main/Main';
import { SendersTable } from './components/tables/SendersTable';
import { SESSendersTable } from './components/tables/SESSendersTable';
import { NotificationService } from '../../services';
import { i18n } from '@osd/i18n';

interface EmailSendersProps extends RouteComponentProps {
  notificationService: NotificationService;
}

export function EmailSenders(props: EmailSendersProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const mainStateContext = useContext(MainContext)!;


  useEffect(() => {
    coreContext.chrome.setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.EMAIL_SENDERS,
    ]);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <EuiTitle size="l">
      <h1>
        {
          i18n.translate('notification.notificationChannels.emailSenders', {
          defaultMessage:
          'Email senders',
        })}
        </h1>
      </EuiTitle>
      {mainStateContext.availableConfigTypes.includes('smtp_account') && (
        <>
          <EuiSpacer />
          <SendersTable coreContext={coreContext} notificationService={props.notificationService} />
        </>
      )}

      {/* UI currently does not fully handle this condition, adding it just to avoid flashing */}
      {mainStateContext.availableConfigTypes.includes('ses_account') && (
        <>
          <EuiSpacer />
          <SESSendersTable coreContext={coreContext} notificationService={props.notificationService} />
        </>
      )}
    </>
  );
}
