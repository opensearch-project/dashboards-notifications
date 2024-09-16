/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ContentPanel } from '../../../../components/ContentPanel';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalConsumer } from '../../../../components/Modal';
import { ServicesContext } from '../../../../services';
import {
  BREADCRUMBS,
  ROUTES,
  setBreadcrumbs,
} from '../../../../utils/constants';
import { renderTime } from '../../../../utils/helpers';
import { ListItemType } from '../../types';
import { MuteChannelModal } from '../modals/MuteChannelModal';
import { ChannelDetailItems } from './ChannelDetailItems';
import { ChannelDetailsActions } from './ChannelDetailsActions';
import { ChannelSettingsDetails } from './ChannelSettingsDetails';
import PageHeader from "../../../../components/PageHeader/PageHeader";
import { TopNavControlButtonData } from '../../../../../../../src/plugins/navigation/public';

interface ChannelDetailsProps extends RouteComponentProps<{
  id: string
}> { }

export function ChannelDetails(props: ChannelDetailsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const id = props.match.params.id;
  const [channel, setChannel] = useState<ChannelItemType>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const sendTestMessage = async () => {
    try {
      await servicesContext.notificationService.sendTestMessage(id);
      coreContext.notifications.toasts.addSuccess(
        'Successfully sent a test message.'
      );
    } catch (error) {
      coreContext.notifications.toasts.addError(error?.body || error, {
        title: 'Failed to send the test message.',
        toastMessage: 'View error details and adjust the channel settings.',
      });
    }
  };

  useEffect(() => {
    setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.CHANNELS,
    ]);
    refresh();
  }, []);

  const refresh = async () => {
    servicesContext.notificationService
      .getChannel(id)
      .then(async (response) => {
        if (response.config_type === 'email') {
          const channel = await servicesContext.notificationService.getEmailConfigDetails(
            response
          );
          if (channel.email?.invalid_ids?.length) {
            coreContext.notifications.toasts.addDanger(
              'The sender and/or some recipient groups might have been deleted.'
            );
          }
          return channel;
        }
        return response;
      })
      .then((response) => {
        setChannel(response);
        setBreadcrumbs([
          BREADCRUMBS.NOTIFICATIONS,
          BREADCRUMBS.CHANNELS,
          {
            text: response?.name || '',
            href: `${BREADCRUMBS.CHANNEL_DETAILS.href}/${id}`,
          },
        ]);
      })
      .catch((error) => {
        const newToast: Toast = {
          id: 'channel-not-found-toast',
          title: 'Channel not found',
          color: 'danger',
          iconType: 'alert',
          text: (
            <>
              <EuiText
                size="s"
                style={{
                  fontWeight: 400,
                  color: 'rgb(52, 55, 65)',
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                The channel might have been deleted.
              </EuiText>
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButton size="s" href={`#${ROUTES.NOTIFICATIONS}`}>
                    View Notifications dashboard
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </>
          ),
        };
        setToasts([...toasts, newToast]);
      });
  };

  const nameList: Array<ListItemType> = [
    {
      title: 'Channel name',
      description: channel?.name || '-',
    },
    {
      title: 'Description',
      description: channel?.description || '-',
    },
    {
      title: 'Last updated',
      description: renderTime(channel?.last_updated_time_ms || NaN),
    },
  ];

  const actionsAndMuteComponent = <EuiFlexGroup gutterSize="m" alignItems="flexEnd">
    <EuiFlexItem />
    <EuiFlexItem grow={false}>
      {channel && (
        <ChannelDetailsActions
          channel={channel} />
      )}
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      {channel && (
        <ModalConsumer>
          {({ onShow }) => (
            <EuiSmallButton
              data-test-subj="channel-details-mute-button"
              iconType={channel.is_enabled ? 'bellSlash' : 'bell'}
              onClick={() => {
                if (channel.is_enabled) {
                  onShow(MuteChannelModal, {
                    selected: [channel],
                    setSelected: (selected: any[]) => setChannel(selected[0]),
                  });
                } else {
                  const newChannel = { ...channel, is_enabled: true };
                  servicesContext.notificationService
                    .updateConfig(channel.config_id, newChannel)
                    .then(() => {
                      coreContext.notifications.toasts.addSuccess(
                        `Channel ${channel.name} successfully unmuted.`
                      );
                      setChannel(newChannel);
                    });
                }
              }}
            >
              {channel.is_enabled ? 'Mute channel' : 'Unmute channel'}
            </EuiSmallButton>
          )}
        </ModalConsumer>
      )}
    </EuiFlexItem>
  </EuiFlexGroup>;
  const rightControls = [
    {
      renderComponent: (
        actionsAndMuteComponent
      ),
    },
    {
      controlType: 'button',
      testId: 'send-test-message-button',
      isDisabled: !channel?.is_enabled,
      run: sendTestMessage,
      label: 'Send test message',
      fill: true,
    } as TopNavControlButtonData,
  ];

  const badgeComponent = <EuiFlexItem grow={false} style={{ paddingBottom: 5 }}>
    {channel?.is_enabled === undefined ? null : channel.is_enabled ? (
      <EuiHealth color="success">Active</EuiHealth>
    ) : (
      <EuiHealth color="subdued">Muted</EuiHealth>
    )}
  </EuiFlexItem>;

  const badgeControls = [
    {
      renderComponent: (
        badgeComponent
      ),
    },
  ];

  return (
    <>
      <PageHeader
        appRightControls={rightControls}
        appBadgeControls={badgeControls}
      >
        {(
          <EuiFlexGroup
          alignItems="center"
          gutterSize="m"
          style={{ maxWidth: 1316 }}
        >
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="m" alignItems="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <h1>{channel?.name ?? '-'}</h1>
                </EuiText>
              </EuiFlexItem>
              {badgeComponent}
            </EuiFlexGroup>
          </EuiFlexItem>
          {actionsAndMuteComponent}
          </EuiFlexGroup>
        )}
      </PageHeader>

      <EuiSpacer />
      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Name and description"
        titleSize="s"
      >
        <ChannelDetailItems listItems={nameList} />
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Configurations"
        titleSize="s"
      >
        <ChannelSettingsDetails channel={channel} />
      </ContentPanel>
    </>
  );
};

