/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCompressedFieldText,
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
  const message = `Delete ${
    num >= 2 ? 'the following senders' : name
  } permanently? Any channels using ${
    num >= 2 ? 'these email senders' : 'this email sender'
  } will not be able to send notifications.`;

  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} maxWidth={500}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{`Delete ${name}?`}</EuiModalHeaderTitle>
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
            To confirm delete, type <i>delete</i> in the field.
          </EuiText>
          <EuiCompressedFieldText
            placeholder="delete"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </EuiModalBody>
        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty onClick={props.onClose}>Cancel</EuiSmallButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
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
                        `${
                          props.senders.length > 1
                            ? props.senders.length + ' senders'
                            : 'Sender ' + props.senders[0].name
                        } successfully deleted.`
                      );
                      props.onClose();
                      setTimeout(() => props.refresh(), SERVER_DELAY);
                    })
                    .catch((error) => {
                      coreContext.notifications.toasts.addError(error?.body || error, {
                        title: 'Failed to delete one or more senders.',
                      });
                      props.onClose();
                    });
                }}
                disabled={input !== 'delete'}
              >
                Delete
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
