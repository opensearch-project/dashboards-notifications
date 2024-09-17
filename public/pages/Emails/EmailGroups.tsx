/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiText } from '@elastic/eui';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../components/coreServices';
import { BREADCRUMBS } from '../../utils/constants';
import { RecipientGroupsTable } from './components/tables/RecipientGroupsTable';
import { NotificationService } from '../../services';
import { getUseUpdatedUx } from '../../services/utils/constants';

interface EmailGroupsProps extends RouteComponentProps {
  notificationService: NotificationService;
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
      {!getUseUpdatedUx() && (
        <>
          <EuiText size="s">
            <h1>Email recipient groups</h1>
          </EuiText>
          <EuiSpacer />
        </>
      )}

      <RecipientGroupsTable coreContext={coreContext}
        notificationService={props.notificationService}
      />
    </>
  );
}
