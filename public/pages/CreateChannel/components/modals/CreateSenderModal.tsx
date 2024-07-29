/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiComboBoxOptionOption,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
} from '@elastic/eui';
import React, { useContext, useState } from 'react';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';
import { ENCRYPTION_TYPE } from '../../../../utils/constants';
import { CreateSenderForm } from '../../../Emails/components/forms/CreateSenderForm';
import { createSenderConfigObject } from '../../../Emails/utils/helper';
import {
  validateEmail,
  validateHost,
  validatePort,
  validateSenderName,
} from '../../../Emails/utils/validationHelper';

import { i18n } from '@osd/i18n';

interface CreateSenderModalProps extends ModalRootProps {
  addSenderOptionAndSelect: (
    senderOption: EuiComboBoxOptionOption<string>
  ) => void;
  onClose: () => void;
}

export function CreateSenderModal(props: CreateSenderModalProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const [senderName, setSenderName] = useState('');
  const [email, setEmail] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [encryption, setEncryption] = useState<keyof typeof ENCRYPTION_TYPE>(
    Object.keys(ENCRYPTION_TYPE)[0] as keyof typeof ENCRYPTION_TYPE
  );
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string[] }>({
    senderName: [],
    email: [],
    host: [],
    port: [],
  });

  const isInputValid = (): boolean => {
    const errors: { [key: string]: string[] } = {
      senderName: validateSenderName(senderName),
      email: validateEmail(email),
      host: validateHost(host),
      port: validatePort(port),
    };
    setInputErrors(errors);
    return !Object.values(errors).reduce(
      (errorFlag, error) => errorFlag || error.length > 0,
      false
    );
  };

  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} style={{ width: 750 }}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            
          {i18n.translate('notification.notificationChannels.createSmtpSender', {
    defaultMessage:
      'Create SMTP sender',
    })}

          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <CreateSenderForm
            senderName={senderName}
            setSenderName={setSenderName}
            email={email}
            setEmail={setEmail}
            host={host}
            setHost={setHost}
            port={port}
            setPort={setPort}
            encryption={encryption}
            setEncryption={setEncryption}
            inputErrors={inputErrors}
            setInputErrors={setInputErrors}
          />
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={props.onClose}>
          {i18n.translate('notification.notificationChannels.information.doCreateSenderCancel', {
    defaultMessage:
      'Create',
    })}

          </EuiButtonEmpty>
          <EuiButton
            data-test-subj="create-sender-modal-create-button"
            fill
            onClick={async () => {
              if (!isInputValid()) {
                coreContext.notifications.toasts.addDanger(
                  i18n.translate('notification.notificationChannels.information.fieldInvalid', {
                    defaultMessage:
                    'Some fields are invalid. Fix all highlighted error(s) before continuing.',
                    })
                );
                return;
              }
              const config = createSenderConfigObject(
                senderName,
                host,
                port,
                encryption,
                email
              );
              await props.services.notificationService
                .createConfig(config)
                .then((response) => {
                  coreContext.notifications.toasts.addSuccess(
                    i18n.translate('notification.notificationChannels.information.senderCreated', {
                      defaultMessage:
                      `Sender ${senderName} successfully created. You can select ${senderName} from the list of senders.`,
                      })
                  );
                  props.addSenderOptionAndSelect({
                    label: senderName,
                    value: response.config_id,
                  });
                  props.onClose();
                })
                .catch((error) => {
                  coreContext.notifications.toasts.addError(error?.body || error, {
                    title: i18n.translate('notification.notificationChannels.information.failedCreateSender', {
                      defaultMessage:
                      'Failed to create sender.',
                      }),
                  });
                });
            }}
          >
            {i18n.translate('notification.notificationChannels.information.doCreateSender', {
    defaultMessage:
      'Utwórz',
    })}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}
