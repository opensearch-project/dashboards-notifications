/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChromeBreadcrumb } from 'opensearch-dashboards/public';
import { getBreadCrumbsSetter, getUseUpdatedUx } from '../services/utils/constants';
import { DataSourceOption } from 'src/plugins/data_source_management/public';
import { i18n } from "@osd/i18n";
import { BehaviorSubject } from 'rxjs';

export const DOCUMENTATION_LINK = '';
export const ALERTING_DOCUMENTATION_LINK =
  'https://opensearch.org/docs/monitoring-plugins/alerting/monitors/#authenticate-sender-account';

export const ROUTES = Object.freeze({
  NOTIFICATIONS: '/notifications',
  CHANNELS: '/channels',
  CHANNEL_DETAILS: '/channel-details',
  CREATE_CHANNEL: '/create-channel',
  EDIT_CHANNEL: '/edit-channel',
  EMAIL_SENDERS: '/email-senders',
  EMAIL_GROUPS: '/email-recipient-groups',
  CREATE_SENDER: '/create-smtp-sender',
  EDIT_SENDER: '/edit-smtp-sender',
  CREATE_SES_SENDER: '/create-ses-sender',
  EDIT_SES_SENDER: '/edit-ses-sender',
  CREATE_RECIPIENT_GROUP: '/create-recipient-group',
  EDIT_RECIPIENT_GROUP: '/edit-recipient-group',
});

export const BREADCRUMBS = Object.freeze({
  NOTIFICATIONS: { text: 'Notification channels', href: '#/' },
  CHANNELS: { text: 'Channels', href: `#${ROUTES.CHANNELS}` },
  CHANNEL_DETAILS: { text: 'Channels', href: `#${ROUTES.CHANNEL_DETAILS}` },
  CREATE_CHANNEL: { text: 'Create channel', href: `#${ROUTES.CREATE_CHANNEL}` },
  EDIT_CHANNEL: { text: 'Edit channel', href: `#${ROUTES.EDIT_CHANNEL}` },
  EDIT_CHANNEL_DETAILS: (name: string) => ({
    text: name,
    href: `#${ROUTES.EDIT_CHANNEL}`,
  }),
  EMAIL_SENDERS: { text: 'Email senders', href: `#${ROUTES.EMAIL_SENDERS}` },
  EMAIL_GROUPS: { text: 'Email recipient groups', href: `#${ROUTES.EMAIL_GROUPS}` },
  CREATE_SENDER: {
    text: 'Create SMTP sender',
    href: `#${ROUTES.CREATE_SENDER}`,
  },
  EDIT_SENDER: { text: 'Edit SMTP sender' },
  CREATE_SES_SENDER: {
    text: 'Create SES sender',
    href: `#${ROUTES.CREATE_SENDER}`,
  },
  EDIT_SES_SENDER: { text: 'Edit SES sender' },
  CREATE_RECIPIENT_GROUP: {
    text: 'Create recipient group',
    href: `#${ROUTES.CREATE_RECIPIENT_GROUP}`,
  },
  EDIT_RECIPIENT_GROUP: { text: 'Edit recipient group', href: `#${ROUTES.EDIT_RECIPIENT_GROUP}`},
  EDIT_RECIPIENT_GROUP_DETAILS: (name: string) => ({
    text: name,
    href: `#${ROUTES.EDIT_RECIPIENT_GROUP}`,
  }),
});

export const ENCRYPTION_TYPE = Object.freeze({
  ssl: 'SSL/TLS',
  start_tls: 'STARTTLS',
  none: 'None',
});

export const SEVERITY_TYPE = Object.freeze({
  none: 'None',
  info: 'Info',
  high: 'High',
  critical: 'Critical',
});

export const CUSTOM_WEBHOOK_ENDPOINT_TYPE = Object.freeze({
  WEBHOOK_URL: 'Webhook URL',
  CUSTOM_URL: 'Custom attributes URL',
});

export function setBreadcrumbs(crumbs: ChromeBreadcrumb[]) {
  getBreadCrumbsSetter()(getUseUpdatedUx() ? crumbs : [BREADCRUMBS.NOTIFICATIONS, ...crumbs]);
}

const LocalCluster: DataSourceOption = {
  label: i18n.translate("dataSource.localCluster", {
    defaultMessage: "Local cluster",
  }) as string,
  id: "",
};

// We should use empty object for default value as local cluster may be disabled
export const dataSourceObservable = new BehaviorSubject<DataSourceOption>({});
