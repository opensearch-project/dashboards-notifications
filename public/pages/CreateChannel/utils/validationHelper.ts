/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import _ from 'lodash';
import { i18n } from '@osd/i18n';

export const validateChannelName = (name: string) => {
  const errors = [];
  if (_.trim(name).length === 0) errors.push(i18n.translate('notification.notificationChannels.channelNameEmptyErr', {
    defaultMessage:
    'Channel name cannot be empty.',
    }));
  return errors;
};

export const validateWebhookURL = (url: string) => {
  const errors = [];
  if (url.length === 0) errors.push(i18n.translate('notification.notificationChannels.KeyValueEmptyErr', {
    defaultMessage:
    'Webhook URL cannot be empty.',
    }));
  else if (!url.match(/^https?:\/\/.+/)) errors.push(i18n.translate('notification.notificationChannels.invalidWebhookUrlErr', {
    defaultMessage:
    'Invalid webhook URL.',
    }));
  return errors;
};

export const validateWebhookKey = (key: string) => {
  const errors = [];
  if (key.length === 0) errors.push(i18n.translate('notification.notificationChannels.KeyValueEmptyErr', {
    defaultMessage:
    'Key cannot be empty.',
    }));
  return errors;
};

export const validateWebhookValue = (value: string) => {
  const errors = [];
  if (value.length === 0) errors.push('Value cannot be empty.');
  return errors;
};

export const validateCustomURLHost = (host: string) => {
  const errors = [];
  if (host.length === 0) errors.push(i18n.translate('notification.notificationChannels.validator.emptyHost', {
    defaultMessage:
    'Host cannot be empty.',
    }));
  return errors;
};

export const validateCustomURLPort = (port: string) => {
  const errors: string[] = [];
  if (port.length === 0) return errors;
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 0 || portNum > 65535)
    errors.push(i18n.translate('notification.notificationChannels.validator.invalidPort', {
      defaultMessage:
      'Invalid port.',
      }));
  return errors;
};

export const validateEmailSender = (
  sender: Array<EuiComboBoxOptionOption<string>> | string
) => {
  const errors = [];
  if (sender.length === 0) errors.push(i18n.translate('notification.notificationChannels.senderEmptyErr', {
    defaultMessage:
    'Sender cannot be empty.',
    }));
  return errors;
};

export const validateRecipients = (
  group: Array<EuiComboBoxOptionOption<string>>
) => {
  const errors = [];
  if (group.length === 0) errors.push(i18n.translate('notification.notificationChannels.defaultRecipientsEmptyErr', {
    defaultMessage:
    'Default recipients cannot be empty.',
    }));
  return errors;
};

export const validateArn = (arn: string) => {
  const errors = [];
  if (arn.length === 0) errors.push(i18n.translate('notification.notificationChannels.arnEmptyErr', {
    defaultMessage:
    'ARN key cannot be empty.',
    }));
  return errors;
};
