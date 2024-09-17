/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SERVER_DELAY } from '../../../../../common';
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
import { RecipientGroupItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';

interface DeleteRecipientGroupModalProps extends ModalRootProps {
  recipientGroups: RecipientGroupItemType[];
  refresh: () => void;
  onClose: () => void;
}

export const DeleteRecipientGroupModal = (
  props: DeleteRecipientGroupModalProps
) => {
  if (!props.recipientGroups.length) return null;

  const coreContext = useContext(CoreServicesContext)!;
  const [input, setInput] = useState('');
  const num = props.recipientGroups.length;
  const name =
    num >= 2 ? `${num} recipient groups` : props.recipientGroups[0].name;
  const message = `Delete ${
    num >= 2 ? 'the following recipient groups' : name
  } permanently? Any channels using ${
    num >= 2 ? 'these email recipient groups' : 'this email recipient group'
  } will not be able to receive notifications.`;

  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} maxWidth={500}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <EuiText size="s">
              <h2>{`Delete ${name}?`}</h2>
            </EuiText>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText size="s">{message}</EuiText>
          {num >= 2 && (
            <>
              <EuiSpacer />
              {props.recipientGroups.map((recipientGroup, i) => (
                <EuiText
                  key={`recipient-groups-list-item-${i}`}
                  style={{ marginLeft: 20 }}
                >
                  <li>{recipientGroup.name}</li>
                </EuiText>
              ))}
            </>
          )}
          <EuiSpacer />
          <EuiText size="s">
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
                data-test-subj="delete-recipient-group-modal-delete-button"
                fill
                color="danger"
                onClick={async() => {
                  props.services.notificationService
                    .deleteConfigs(
                      props.recipientGroups.map((recipientGroup) => recipientGroup.config_id)
                    )
                    .then((resp) => {
                      coreContext.notifications.toasts.addSuccess(
                        `${props.recipientGroups.length > 1
                          ? props.recipientGroups.length + ' recipient groups'
                          : 'Recipient group ' + props.recipientGroups[0].name
                        } successfully deleted.`
                      );
                      props.onClose();
                      setTimeout(() => props.refresh(), SERVER_DELAY);
                    })
                    .catch((error) => {
                      coreContext.notifications.toasts.addError(error?.body || error, {
                        title: 'Failed to delete one or more recipient groups.',
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
