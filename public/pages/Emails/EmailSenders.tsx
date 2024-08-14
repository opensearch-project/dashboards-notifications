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
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { ApplicationStart } from 'opensearch-dashboards/public';

interface EmailSendersProps extends RouteComponentProps {
  notificationService: NotificationService;
  navigationUI: NavigationPublicPluginStart['ui'];
  showActionsInHeader: boolean;
  application: ApplicationStart;
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

  const showActionsInHeader = props.showActionsInHeader;

  return (
    <>
      {!showActionsInHeader && (
        <EuiTitle size="l">
          <h1>Email senders</h1>
        </EuiTitle>
      )}
      {mainStateContext.availableConfigTypes.includes('smtp_account') && (
        <>
          <EuiSpacer />
          <SendersTable coreContext={coreContext}
            notificationService={props.notificationService}
            navigationUI={props.navigationUI}
            showActionsInHeader={props.showActionsInHeader}
            application={props.application}
          />
        </>
      )}

      {/* UI currently does not fully handle this condition, adding it just to avoid flashing */}
      {mainStateContext.availableConfigTypes.includes('ses_account') && (
        <>
          <EuiSpacer />
          <SESSendersTable coreContext={coreContext}
            notificationService={props.notificationService}
            navigationUI={props.navigationUI}
            showActionsInHeader={props.showActionsInHeader}
            application={props.application}
          />
        </>
      )}
    </>
  );
}
