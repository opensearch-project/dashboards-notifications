/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';

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
  NOTIFICATIONS: { text: 'Notifications', href: '#/' },
  CHANNELS: { text: i18n.translate('notification.notificationChannels.Title', {
    defaultMessage:
      'Channels',
    }), href: `#${ROUTES.CHANNELS}` },
  CHANNEL_DETAILS: { text: i18n.translate('notification.notificationChannels.Details', {
    defaultMessage:
      'Channels',
  }), href: `#${ROUTES.CHANNEL_DETAILS}` },
  CREATE_CHANNEL: { text: i18n.translate('notification.notificationChannels.newChannel', {
    defaultMessage:
      'New channel',
    }), href: `#${ROUTES.CREATE_CHANNEL}` },
  EDIT_CHANNEL: { text: i18n.translate('notification.notificationChannels.editChannel', {
    defaultMessage:
      'Edit channel',
    }) },
  EMAIL_SENDERS: { text: i18n.translate('notification.notificationChannels.emailSenders', {
    defaultMessage:
      'Email senders',
    }), href: `#${ROUTES.EMAIL_SENDERS}` },
  EMAIL_GROUPS: { text: 'Email recipient groups', href: `#${ROUTES.EMAIL_GROUPS}` },
  CREATE_SENDER: {
    text: i18n.translate('notification.notificationChannels.createSmtpSender', {
      defaultMessage:
      'Create SMTP sender',
      }),
    href: `#${ROUTES.CREATE_SENDER}`,
  },
  EDIT_SENDER: { text: i18n.translate('notification.notificationChannels.editSmtpSender', {
    defaultMessage:
      'Edit SMTP sender',
    }) },
  CREATE_SES_SENDER: {
    text: i18n.translate('notification.notificationChannels.createSesSender', {
      defaultMessage:
        'Create SES sender',
      }),
    href: `#${ROUTES.CREATE_SENDER}`,
  },
  EDIT_SES_SENDER: { text: i18n.translate('notification.notificationChannels.editSesSender', {
    defaultMessage:
    'Edit SES sender' ,
    })},
  CREATE_RECIPIENT_GROUP: {
    text: i18n.translate('notification.notificationChannels.createRecipientGroup', {
      defaultMessage:
      'Create recipient group',
      }),
    href: `#${ROUTES.CREATE_RECIPIENT_GROUP}`,
  },
  EDIT_RECIPIENT_GROUP: { text: i18n.translate('notification.notificationChannels.editRecipientGroup', {
    defaultMessage:
    'Edit recipient group',
    }) },
});

export const BACKEND_CHANNEL_TYPE = Object.freeze({
  SLACK: 'slack',
  EMAIL: 'email',
  CHIME: 'chime',
  MICROSOFT_TEAMS: 'microsoft_teams',
  CUSTOM_WEBHOOK: 'webhook',
  SNS: 'sns',
});

export const CHANNEL_TYPE = Object.freeze({
  [BACKEND_CHANNEL_TYPE.SLACK]: 'Slack',
  [BACKEND_CHANNEL_TYPE.EMAIL]: 'Email',
  [BACKEND_CHANNEL_TYPE.CHIME]: 'Chime',
  [BACKEND_CHANNEL_TYPE.MICROSOFT_TEAMS]: 'Microsoft Teams',
  [BACKEND_CHANNEL_TYPE.CUSTOM_WEBHOOK]: 'Webhook',
  [BACKEND_CHANNEL_TYPE.SNS]: 'Amazon SNS',
}) as {
  slack: string;
  email: string;
  chime: string;
  microsoft_teams: string;
  webhook: string;
  sns: string;
};

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
  CUSTOM_URL: i18n.translate('notification.notificationChannels.CustomWebhookUrl', {
    defaultMessage:
      'Custom Webhook URL',
    }),
});
