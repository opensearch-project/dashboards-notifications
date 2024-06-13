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
import { MainContext } from '../Main/Main';
import { NotificationService } from '../../services';
import { i18n } from '@osd/i18n';

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
      <EuiTitle size="l">
      <h1> 
          {
          i18n.translate('notification.notificationChannels.emailRecipientsGroupsList', {
          defaultMessage:
          'Email recipient groups',
        })}
    </h1>

      </EuiTitle>

      <EuiSpacer />
      <RecipientGroupsTable coreContext={coreContext} notificationService={props.notificationService} />
    </>
  );
}
