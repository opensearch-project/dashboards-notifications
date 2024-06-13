/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiText,
} from '@elastic/eui';
import React, { useContext } from 'react';
import { SERVER_DELAY } from '../../../../../common';
import { ChannelItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';
import { i18n } from '@osd/i18n';

interface MuteChannelModalProps extends ModalRootProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  refresh?: () => void;
  onClose: () => void;
}

export const MuteChannelModal = (props: MuteChannelModalProps) => {
  if (props.selected.length !== 1) return null;

  const coreContext = useContext(CoreServicesContext)!;
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} maxWidth={500}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{`Mute ${props.selected[0].name}?`}</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText>
          {i18n.translate('notification.notificationChannels.muteChannelDescription', {
          defaultMessage:
            'This channel will stop sending notifications to its recipients. However, the channel will remain available for selection.',
          })}
            
          </EuiText>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={props.onClose}>
              {i18n.translate('notification.notificationChannels.information.doCreateSenderCancel', {
              defaultMessage:
                'Cancel',
              })}
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                data-test-subj="mute-channel-modal-mute-button"
                onClick={async () => {
                  const channel = { ...props.selected[0], is_enabled: false };
                  await props.services.notificationService
                    .updateConfig(channel.config_id, channel)
                    .then((resp) => {
                      coreContext.notifications.toasts.addSuccess(
                        i18n.translate('notification.notificationChannels.channelMuted', {
                          defaultMessage:
                          `Channel ${channel.name} successfully muted.`,
                          })
                      );
                      props.setSelected([channel]);
                      if (props.refresh)
                        setTimeout(() => props.refresh!(), SERVER_DELAY);
                    })
                    .catch((error) => {
                      coreContext.notifications.toasts.addError(error?.body || error, {
                        title: i18n.translate('notification.notificationChannels.muteChannelFailedErr', {
                          defaultMessage:
                          'Failed to mute channel',
                          }),
                      });
                    });
                  props.onClose();
                }}
              >
                {i18n.translate('notification.notificationChannels.muteAction', {
                  defaultMessage:
                    'Mute',
                  })}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
