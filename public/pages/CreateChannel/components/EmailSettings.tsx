/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiCompressedComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedRadioGroup,
  EuiSpacer,
  SortDirection,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SenderType } from '../../../../models/interfaces';
import { CoreServicesContext } from '../../../components/coreServices';
import { ModalConsumer } from '../../../components/Modal';
import { ServicesContext } from '../../../services';
import { getErrorMessage } from '../../../utils/helpers';
import { onComboBoxCreateOption } from '../../Emails/utils/helper';
import { MainContext } from '../../Main/Main';
import { CreateChannelContext } from '../CreateChannel';
import {
  validateEmailSender,
  validateRecipients,
} from '../utils/validationHelper';
import { CreateRecipientGroupModal } from './modals/CreateRecipientGroupModal';
import { CreateSenderModal } from './modals/CreateSenderModal';
import { CreateSESSenderModal } from './modals/CreateSESSenderModal';

interface EmailSettingsProps {
  senderType: SenderType;
  setSenderType: (senderType: SenderType) => void;
  selectedSmtpSenderOptions: Array<EuiComboBoxOptionOption<string>>;
  setSelectedSmtpSenderOptions: (
    options: Array<EuiComboBoxOptionOption<string>>
  ) => void;
  selectedSesSenderOptions: Array<EuiComboBoxOptionOption<string>>;
  setSelectedSesSenderOptions: (
    options: Array<EuiComboBoxOptionOption<string>>
  ) => void;
  selectedRecipientGroupOptions: Array<EuiComboBoxOptionOption<string>>;
  setSelectedRecipientGroupOptions: (
    options: Array<EuiComboBoxOptionOption<string>>
  ) => void;
}

export function EmailSettings(props: EmailSettingsProps) {
  const context = useContext(CreateChannelContext)!;
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const mainStateContext = useContext(MainContext)!;
  const [smtpAvailable, setSmtpAvailable] = useState(true);

  useEffect(() => {
    if (!mainStateContext.availableConfigTypes.includes('smtp_account')) {
      setSmtpAvailable(false);
      props.setSenderType('ses_account');
    }
  }, []);

  const [sesSenderOptions, setSesSenderOptions] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >([]);
  const [smtpSenderOptions, setSmtpSenderOptions] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >([]);
  const [recipientGroupOptions, setRecipientGroupOptions] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >([]);

  const getQueryObject = (config_type: string, query?: string) => ({
    from_index: 0,
    max_items: 10000,
    config_type,
    sort_field: 'name',
    sort_order: SortDirection.ASC,
    ...(query ? { query } : {}),
  });

  const refreshSenders = useCallback(async (query?: string) => {
    try {
      const smtpSenders = await servicesContext.notificationService.getSenders(
        getQueryObject('smtp_account', query)
      );
      setSmtpSenderOptions(
        smtpSenders.items.map((sender) => ({
          label: sender.name,
          value: sender.config_id,
        }))
      );
      const sesSenders = await servicesContext.notificationService.getSenders(
        getQueryObject('ses_account', query)
      );
      setSesSenderOptions(
        sesSenders.items.map((sender) => ({
          label: sender.name,
          value: sender.config_id,
        }))
      );
    } catch (error) {
      coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading senders.')
      );
    }
  }, []);

  const refreshRecipientGroups = useCallback(async (query?: string) => {
    try {
      const recipientGroups = await servicesContext.notificationService.getRecipientGroups(
        getQueryObject('email_group', query)
      );
      setRecipientGroupOptions(
        recipientGroups.items.map((recipientGroup) => ({
          label: recipientGroup.name,
          value: recipientGroup.config_id,
        }))
      );
    } catch (error) {
      coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading recipient groups.')
      );
    }
  }, []);

  useEffect(() => {
    refreshSenders();
    refreshRecipientGroups();
  }, []);

  return (
    <>
      {smtpAvailable && (
        <EuiCompressedFormRow label="Sender type">
          <EuiCompressedRadioGroup
            options={[
              {
                id: 'smtp_account',
                label: 'SMTP sender',
              },
              {
                id: 'ses_account',
                label: 'SES sender',
              },
            ]}
            idSelected={props.senderType}
            onChange={(id) => props.setSenderType(id as SenderType)}
            name="sender type radio group"
          />
        </EuiCompressedFormRow>
      )}
      {props.senderType === 'ses_account' ? (
        <>
          <EuiSpacer size="m" />
          <EuiFlexGroup>
            <EuiFlexItem style={{ maxWidth: 400 }}>
              <EuiCompressedFormRow
                label="SES sender"
                helpText={`A destination only allows one SES sender. Use "Create SES sender" to create a sender with its email address, IAM role, AWS region.`}
                error={context.inputErrors.sesSender.join(' ')}
                isInvalid={context.inputErrors.sesSender.length > 0}
              >
                <EuiCompressedComboBox
                  placeholder="Sender name"
                  fullWidth
                  singleSelection
                  options={sesSenderOptions}
                  selectedOptions={props.selectedSesSenderOptions}
                  onChange={props.setSelectedSesSenderOptions}
                  isClearable={true}
                  isInvalid={context.inputErrors.sesSender.length > 0}
                  onBlur={() => {
                    context.setInputErrors({
                      ...context.inputErrors,
                      sesSender: validateEmailSender(
                        props.selectedSesSenderOptions
                      ),
                    });
                  }}
                />
              </EuiCompressedFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiCompressedFormRow hasEmptyLabelSpace>
                <ModalConsumer>
                  {({ onShow }) => (
                    <EuiSmallButton
                      onClick={() =>
                        onShow(CreateSESSenderModal, {
                          addSenderOptionAndSelect: (
                            newOption: EuiComboBoxOptionOption<string>
                          ) => {
                            setSesSenderOptions([
                              ...sesSenderOptions,
                              newOption,
                            ]);
                            props.setSelectedSesSenderOptions([newOption]);
                            context.setInputErrors({
                              ...context.inputErrors,
                              sesSender: validateEmailSender([newOption]),
                            });
                          },
                        })
                      }
                    >
                      Create SES sender
                    </EuiSmallButton>
                  )}
                </ModalConsumer>
              </EuiCompressedFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      ) : (
        <>
          <EuiSpacer size="m" />
          <EuiFlexGroup>
            <EuiFlexItem style={{ maxWidth: 400 }}>
              <EuiCompressedFormRow
                label="SMTP sender"
                helpText={`A destination only allows one SMTP sender. Use "Create SMTP sender" to create a sender with its email address, host, port, encryption method.`}
                error={context.inputErrors.smtpSender.join(' ')}
                isInvalid={context.inputErrors.smtpSender.length > 0}
              >
                <EuiCompressedComboBox
                  placeholder="Sender name"
                  fullWidth
                  singleSelection
                  options={smtpSenderOptions}
                  selectedOptions={props.selectedSmtpSenderOptions}
                  onChange={props.setSelectedSmtpSenderOptions}
                  isClearable={true}
                  isInvalid={context.inputErrors.smtpSender.length > 0}
                  onBlur={() => {
                    context.setInputErrors({
                      ...context.inputErrors,
                      smtpSender: validateEmailSender(
                        props.selectedSmtpSenderOptions
                      ),
                    });
                  }}
                />
              </EuiCompressedFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiCompressedFormRow hasEmptyLabelSpace>
                <ModalConsumer>
                  {({ onShow }) => (
                    <EuiSmallButton
                      onClick={() =>
                        onShow(CreateSenderModal, {
                          addSenderOptionAndSelect: (
                            newOption: EuiComboBoxOptionOption<string>
                          ) => {
                            setSmtpSenderOptions([
                              ...smtpSenderOptions,
                              newOption,
                            ]);
                            props.setSelectedSmtpSenderOptions([newOption]);
                            context.setInputErrors({
                              ...context.inputErrors,
                              smtpSender: validateEmailSender([newOption]),
                            });
                          },
                        })
                      }
                    >
                      Create SMTP sender
                    </EuiSmallButton>
                  )}
                </ModalConsumer>
              </EuiCompressedFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}

      <EuiFlexGroup>
        <EuiFlexItem style={{ maxWidth: 400 }}>
          <EuiCompressedFormRow
            label="Default recipients"
            helpText={`Add recipient(s) using an email address or pre-created email group. Use "Create email group" to create an email group.`}
            error={context.inputErrors.recipients.join(' ')}
            isInvalid={context.inputErrors.recipients.length > 0}
          >
            <EuiCompressedComboBox
              placeholder="Email address, recipient group name"
              fullWidth
              options={recipientGroupOptions}
              selectedOptions={props.selectedRecipientGroupOptions}
              onChange={props.setSelectedRecipientGroupOptions}
              onCreateOption={(searchValue, flattenedOptions) =>
                onComboBoxCreateOption(
                  searchValue,
                  flattenedOptions,
                  recipientGroupOptions,
                  setRecipientGroupOptions,
                  props.selectedRecipientGroupOptions,
                  props.setSelectedRecipientGroupOptions,
                  (options) =>
                    context.setInputErrors({
                      ...context.inputErrors,
                      recipients: validateRecipients(options),
                    })
                )
              }
              customOptionText={'Add {searchValue} as a default recipient'}
              isClearable={true}
              isInvalid={context.inputErrors.recipients.length > 0}
              onBlur={() => {
                context.setInputErrors({
                  ...context.inputErrors,
                  recipients: validateRecipients(
                    props.selectedRecipientGroupOptions
                  ),
                });
              }}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiCompressedFormRow hasEmptyLabelSpace>
            <ModalConsumer>
              {({ onShow }) => (
                <EuiSmallButton
                  onClick={() =>
                    onShow(CreateRecipientGroupModal, {
                      addRecipientGroupOptionAndSelect: (
                        newOption: EuiComboBoxOptionOption<string>
                      ) => {
                        setRecipientGroupOptions([
                          ...recipientGroupOptions,
                          newOption,
                        ]);
                        props.setSelectedRecipientGroupOptions([
                          ...props.selectedRecipientGroupOptions,
                          newOption,
                        ]);
                        context.setInputErrors({
                          ...context.inputErrors,
                          recipients: validateRecipients([newOption]),
                        });
                      },
                    })
                  }
                >
                  Create recipient group
                </EuiSmallButton>
              )}
            </ModalConsumer>
          </EuiCompressedFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
