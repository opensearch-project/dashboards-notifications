/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiGlobalToastList,
  EuiHealth,
  EuiSpacer,
  EuiText,
  EuiTitle,
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
} from '../../../../utils/constants';
import { renderTime } from '../../../../utils/helpers';
import { ListItemType } from '../../types';
import { MuteChannelModal } from '../modals/MuteChannelModal';
import { ChannelDetailItems } from './ChannelDetailItems';
import { ChannelDetailsActions } from './ChannelDetailsActions';
import { ChannelSettingsDetails } from './ChannelSettingsDetails';
import { NavigationPublicPlugin } from 'src/plugins/navigation/public/plugin';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { ApplicationStart } from 'opensearch-dashboards/public';

interface ChannelDetailsProps extends RouteComponentProps<{
  id: string
}> {
  navigationUI: NavigationPublicPluginStart['ui'];
  showActionsInHeader: boolean;
  application: ApplicationStart;
}

export function ChannelDetails(props: ChannelDetailsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const id = props.match.params.id;
  const [channel, setChannel] = useState<ChannelItemType>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ChannelHeaderContent = () => {
    const coreContext = useContext(CoreServicesContext)!;
    const servicesContext = useContext(ServicesContext)!;

    return (
      <EuiFlexGroup gutterSize="m" alignItems="flexEnd">
        <EuiFlexItem grow={false} style={{ paddingBottom: 5 }}>
          {channel?.is_enabled === undefined ? null : channel.is_enabled ? (
            <EuiHealth color="success">Active</EuiHealth>
          ) : (
            <EuiHealth color="subdued">Muted</EuiHealth>
          )}
        </EuiFlexItem>
        <EuiFlexItem />
        <EuiFlexItem grow={false}>
          {channel && <ChannelDetailsActions channel={channel} />}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {channel && (
            <ModalConsumer>
              {({ onShow }) => (
                <EuiButton
                  data-test-subj="channel-details-mute-button"
                  iconType={channel?.is_enabled ? 'bellSlash' : 'bell'}
                  onClick={() => {
                    if (!channel) return;
                    if (channel.is_enabled) {
                      onShow(MuteChannelModal, {
                        selected: [channel],
                        setSelected: (selected) => setChannel(selected[0]),
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
                  {channel?.is_enabled ? 'Mute channel' : 'Unmute channel'}
                </EuiButton>
              )}
            </ModalConsumer>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };


  useEffect(() => {
    coreContext.chrome.setBreadcrumbs([
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
        coreContext.chrome.setBreadcrumbs([
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


  const { HeaderControl } = props.navigationUI;
  const showActionsInHeader = props.showActionsInHeader;
  const { setAppRightControls } = props.application;


  return (
    <>
      {showActionsInHeader ? (
        <>
          <HeaderControl
            setMountPoint={setAppRightControls}
            controls={[
              {
                renderComponent: (
                  <ChannelHeaderContent channel={channel} setChannel={setChannel} />
                ),
              },
            ]}
            bodyStyles={{ padding: 'initial' }}
            title="Channel Details"
            titleSize="m"
          />
        </>
      ) : (
        <div>
          <EuiTitle size="l">
            <h1>{channel?.name || '-'}</h1>
          </EuiTitle>
          <EuiFlexGroup gutterSize="m" alignItems="flexEnd">
            <EuiFlexItem grow={false} style={{ paddingBottom: 5 }}>
              {channel?.is_enabled === undefined ? null : channel.is_enabled ? (
                <EuiHealth color="success">Active</EuiHealth>
              ) : (
                <EuiHealth color="subdued">Muted</EuiHealth>
              )}
            </EuiFlexItem>
            <EuiFlexItem />
            <EuiFlexItem grow={false}>
              {channel && <ChannelDetailsActions channel={channel} />}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {channel && (
                <ModalConsumer>
                  {({ onShow }) => (
                    <EuiButton
                      data-test-subj="channel-details-mute-button"
                      iconType={channel?.is_enabled ? 'bellSlash' : 'bell'}
                      onClick={() => {
                        if (!channel) return;
                        if (channel.is_enabled) {
                          onShow(MuteChannelModal, {
                            selected: [channel],
                            setSelected: (selected) => setChannel(selected[0]),
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
                      {channel?.is_enabled ? 'Mute channel' : 'Unmute channel'}
                    </EuiButton>
                  )}
                </ModalConsumer>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )}

      <EuiSpacer />
      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Name and description"
        titleSize="s"
        panelStyles={{ maxWidth: 1300 }}
      >
        <ChannelDetailItems listItems={nameList} />
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Configurations"
        titleSize="s"
        panelStyles={{ maxWidth: 1300 }}
      >
        <ChannelSettingsDetails channel={channel} />
      </ContentPanel>

    </>
  );
};

