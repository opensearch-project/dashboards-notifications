/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useContext, useState } from 'react';
import { SERVER_DELAY } from '../../../../../common';
import { SenderItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';
import { i18n } from '@osd/i18n';

interface DeleteSenderModalProps extends ModalRootProps {
  senders: SenderItemType[];
  refresh: () => void;
  onClose: () => void;
}

export const DeleteSenderModal = (props: DeleteSenderModalProps) => {
  if (!props.senders.length) return null;

  const coreContext = useContext(CoreServicesContext)!;
  const [input, setInput] = useState('');
  const num = props.senders.length;
  const name = num >= 2 ? `${num} senders` : props.senders[0].name;
  const message = i18n.translate('notification.notificationChannels.deleteSendersSummary', {
    defaultMessage:
    `Delete ${
      num >= 2 ? 'the following senders' : name
    } permanently? Any channels using ${
      num >= 2 ? 'these email senders' : 'this email sender'
    } will not be able to send notifications.`,
    values:{name: name}
    });

  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} maxWidth={500}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
          {i18n.translate('notification.notificationChannels.deleteSenderTitle', {
            defaultMessage:
            `Delete ${name}?`,
            values: {name:name}
            })}
            </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText>{message}</EuiText>
          {num >= 2 && (
            <>
              <EuiSpacer />
              {props.senders.map((sender, i) => (
                <EuiText
                  key={`sender-list-item-${i}`}
                  style={{ marginLeft: 20 }}
                >
                  <li>{sender.name}</li>
                </EuiText>
              ))}
            </>
          )}
          <EuiSpacer />
          <EuiText>
          {i18n.translate('notification.notificationChannels.deleteChannelConfirmation', {
          defaultMessage:
            'To confirm delete, type delete in the field.',
          })}
          </EuiText>
          <EuiFieldText
            placeholder="delete"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
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
                data-test-subj="delete-sender-modal-delete-button"
                fill
                color="danger"
                onClick={async () => {
                  props.services.notificationService
                    .deleteConfigs(
                      props.senders.map((sender) => sender.config_id)
                    )
                    .then((resp) => {
                      coreContext.notifications.toasts.addSuccess(
                        i18n.translate('notification.notificationChannels.deleteSenderToastSuccess', {
                          defaultMessage:
                          `${
                            props.senders.length > 1
                              ? props.senders.length + ' senders'
                              : 'Sender ' + props.senders[0].name
                          } successfully deleted.`,
                          values:{name:props.senders[0].name}
                          })
                        
                      );
                      props.onClose();
                      setTimeout(() => props.refresh(), SERVER_DELAY);
                    })
                    .catch((error) => {
                      coreContext.notifications.toasts.addError(error?.body || error, {
                        title: i18n.translate('notification.notificationChannels.deleteSenderFailedErr', {
                          defaultMessage:
                          'Failed to delete one or more senders.',
                          }),
                      });
                      props.onClose();
                    });
                }}
                disabled={input !== 'delete'}
              >
                {i18n.translate('notification.notificationChannels.deleteToken', {
                  defaultMessage:
                    'Delete',
                  })}
                
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
