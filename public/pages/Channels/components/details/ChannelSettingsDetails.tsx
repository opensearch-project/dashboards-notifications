/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiLink } from '@elastic/eui';
import React from 'react';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ModalConsumer } from '../../../../components/Modal';
import { BACKEND_CHANNEL_TYPE, CHANNEL_TYPE } from '../../../../../common/constants';
import {
  deconstructEmailObject,
  deconstructWebhookObject,
} from '../../../CreateChannel/utils/helper';
import { HeaderItemType, ListItemType } from '../../types';
import { DetailsListModal } from '../modals/DetailsListModal';
import { DetailsTableModal } from '../modals/DetailsTableModal';
import { ChannelDetailItems } from './ChannelDetailItems';
import { i18n } from '@osd/i18n';

interface ChannelSettingsDetailsProps {
  channel: ChannelItemType | undefined;
}

export function ChannelSettingsDetails(props: ChannelSettingsDetailsProps) {
  if (!props.channel) return null;

  const settingsList: Array<ListItemType> = [];
  const getModalComponent = (
    items: string[] | HeaderItemType[],
    header: string,
    title?: string,
    separator = ', ',
    isParameters?: boolean
  ) => {
    return (
      <>
        <div style={{ whiteSpace: 'pre-line' }}>
          {items
            .slice(0, 5)
            .map((item: string | HeaderItemType) =>
              typeof item === 'string' ? item : `${item.key}: ${item.value}`
            )
            .join(separator) || '-'}
        </div>
        {items.length > 5 && (
          <>
            {' '}
            <ModalConsumer>
              {({ onShow }) => (
                <EuiLink
                  onClick={
                    typeof items[0] === 'string'
                      ? () =>
                          onShow(DetailsListModal, {
                            header: `${header} (${items.length})`,
                            title: title,
                            items: items,
                          })
                      : () =>
                          onShow(DetailsTableModal, {
                            header: `${header} (${items.length})`,
                            isParameters,
                            items: items,
                          })
                  }
                >
                  {items.length - 5} more
                </EuiLink>
              )}
            </ModalConsumer>
          </>
        )}
      </>
    );
  };

  const type = props.channel.config_type as keyof typeof CHANNEL_TYPE;
  if (type === BACKEND_CHANNEL_TYPE.SLACK) {
    settingsList.push(
      ...[
        {
          title: 'Channel type',
          description: CHANNEL_TYPE.slack,
        },
        {
          title: 'Webhook URL',
          description: props.channel.slack!.url || '-',
        },
      ]
    );
  } else if (type === BACKEND_CHANNEL_TYPE.CHIME) {
    settingsList.push(
      ...[
        {
          title: 'Channel type',
          description: CHANNEL_TYPE.chime,
        },
        {
          title: 'Webhook URL',
          description: props.channel.chime!.url || '-',
        },
      ]
    );
  } else if (type === BACKEND_CHANNEL_TYPE.MICROSOFT_TEAMS) {
    settingsList.push(
      ...[
        {
          title: 'Channel type',
          description: CHANNEL_TYPE.microsoft_teams,
        },
        {
          title: 'Webhook URL',
          description: props.channel.microsoft_teams!.url || '-',
        },
      ]
    );
  } else if (type === BACKEND_CHANNEL_TYPE.EMAIL) {
    const emailObject = deconstructEmailObject(props.channel.email!);
    const recipientsDescription = getModalComponent(
      emailObject.selectedRecipientGroupOptions.map((group) => group.label),
      i18n.translate('notification.notificationChannels.defaultEmailRecipients', {
        defaultMessage:
        'Default recipients',
        })
    ,
    i18n.translate('notification.notificationChannels.EmailRecipients', {
      defaultMessage:
      'Recipients',
      })
  
    );
    settingsList.push(
      ...[
        {
          title: i18n.translate('notification.notificationChannels.channelType', {
            defaultMessage:
            'Channel type',
            })
        ,
          description: CHANNEL_TYPE.email,
        },
        {
          title: i18n.translate('notification.notificationChannels.senderType', {
            defaultMessage:
              'Sender',
            })
        ,
          description: emailObject.selectedSenderOptions[0].label || '-',
        },
        {
          title: i18n.translate('notification.notificationChannels.defaultEmailRecipients', {
            defaultMessage:
            'Default recipients',
            })
        ,
          description: recipientsDescription,
        },
      ]
    );
  } else if (type === BACKEND_CHANNEL_TYPE.CUSTOM_WEBHOOK) {
    const webhookObject = deconstructWebhookObject(props.channel.webhook!);
    const parametersDescription = getModalComponent(
      webhookObject.webhookParams,
      i18n.translate('notification.notificationChannels.queryParameters', {
        defaultMessage:
        'Query parameters',
        })
    ,
      undefined,
      '\n',
      true
    );
    const headersDescription = getModalComponent(
      webhookObject.webhookHeaders,
      i18n.translate('notification.notificationChannels.webhookHeaders', {
        defaultMessage:
        'Webhook headers',
        })
    ,
      undefined,
      '\n',
      false
    );
    settingsList.push(
      ...[
        {
          title: 'Channel type',
          description: CHANNEL_TYPE.webhook,
        },
        {
          title: 'Method',
          description: webhookObject.webhookMethod || '-',
        },
        {
          title: 'Type',
          description: webhookObject.customURLType || '-',
        },
        {
          title: 'Host',
          description: webhookObject.customURLHost || '-',
        },
        {
          title: 'Port',
          description: webhookObject.customURLPort || '-',
        },
        {
          title: 'Path',
          description: webhookObject.customURLPath || '-',
        },
        {
          title: 'Query parameters',
          description: parametersDescription,
        },
        {
          title: 'Webhook headers',
          description: headersDescription,
        },
      ]
    );
  } else if (type === BACKEND_CHANNEL_TYPE.SNS) {
    settingsList.push(
      ...[
        {
          title: 'Channel type',
          description: CHANNEL_TYPE.sns,
        },
        {
          title: 'SNS topic ARN',
          description: props.channel.sns?.topic_arn || '-',
        },
        {
          title: 'IAM role ARN',
          description: props.channel.sns?.role_arn || '-',
        },
      ]
    );
  }

  return (
    <>
      <ChannelDetailItems listItems={settingsList} />
    </>
  );
}
