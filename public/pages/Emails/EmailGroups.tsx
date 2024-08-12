/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiTitle } from '@elastic/eui';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../components/coreServices';
import { BREADCRUMBS } from '../../utils/constants';
import { RecipientGroupsTable } from './components/tables/RecipientGroupsTable';
import { NotificationService } from '../../services';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { ApplicationStart } from 'opensearch-dashboards/public';

interface EmailGroupsProps extends RouteComponentProps {
  notificationService: NotificationService;
  navigationUI: NavigationPublicPluginStart['ui'];
  showActionsInHeader: boolean;
  application: ApplicationStart;
}

export function EmailGroups(props: EmailGroupsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  useEffect(() => {
    coreContext.chrome.setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.EMAIL_GROUPS,
    ]);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {!props.showActionsInHeader && (
        <EuiTitle size="l">
          <h1>Email recipient groups</h1>
        </EuiTitle>
      )}

      <EuiSpacer />
      <RecipientGroupsTable coreContext={coreContext} 
      notificationService={props.notificationService} 
      navigationUI={props.navigationUI} // Pass values from NavigationMenuContext
      showActionsInHeader={props.showActionsInHeader} // Pass values from NavigationMenuContext
      application={props.application} // Pass values from NavigationMenuContext
      />
    </>
  );
}
