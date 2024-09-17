/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiCompressedFieldNumber,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiLink,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui';
import React from 'react';
import {
  ALERTING_DOCUMENTATION_LINK,
  ENCRYPTION_TYPE,
} from '../../../../utils/constants';
import {
  validateEmail,
  validateHost,
  validatePort,
  validateSenderName,
} from '../../utils/validationHelper';

interface CreateSenderFormProps {
  senderName: string;
  setSenderName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  host: string;
  setHost: (host: string) => void;
  port: string;
  setPort: (port: string) => void;
  encryption: keyof typeof ENCRYPTION_TYPE;
  setEncryption: (encryption: keyof typeof ENCRYPTION_TYPE) => void;
  inputErrors: { [key: string]: string[] };
  setInputErrors: (errors: { [key: string]: string[] }) => void;
}

export function CreateSenderForm(props: CreateSenderFormProps) {
  const encryptionOptions: Array<EuiSuperSelectOption<
    keyof typeof ENCRYPTION_TYPE
  >> = Object.entries(ENCRYPTION_TYPE).map(([key, value]) => ({
    value: key as keyof typeof ENCRYPTION_TYPE,
    inputDisplay: value,
  }));

  return (
    <>
      <EuiCompressedFormRow
        label="Sender name"
        style={{ maxWidth: '650px' }}
        helpText="Use a unique, descriptive name. The sender name must contain from 2 to 50 characters. Valid characters are lowercase a-z, 0-9, - (hyphen) and _ (underscore)."
        error={props.inputErrors.senderName.join(' ')}
        isInvalid={props.inputErrors.senderName.length > 0}
      >
        <EuiCompressedFieldText
          fullWidth
          placeholder="Enter sender name"
          data-test-subj="create-sender-form-name-input"
          value={props.senderName}
          onChange={(e) => props.setSenderName(e.target.value)}
          isInvalid={props.inputErrors.senderName.length > 0}
          onBlur={() => {
            props.setInputErrors({
              ...props.inputErrors,
              senderName: validateSenderName(props.senderName),
            });
          }}
        />
      </EuiCompressedFormRow>

      <EuiSpacer size="l" />
      <EuiFlexGroup gutterSize="s" style={{ maxWidth: '658px' }}>
        <EuiFlexItem grow={4}>
          <EuiCompressedFormRow
            label="Email address"
            error={props.inputErrors.email.join(' ')}
            isInvalid={props.inputErrors.email.length > 0}
          >
            <EuiCompressedFieldText
              placeholder="name@example.com"
              data-test-subj="create-sender-form-email-input"
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)}
              isInvalid={props.inputErrors.email.length > 0}
              onBlur={() => {
                props.setInputErrors({
                  ...props.inputErrors,
                  email: validateEmail(props.email),
                });
              }}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={4}>
          <EuiCompressedFormRow
            label="Host"
            error={props.inputErrors.host.join(' ')}
            isInvalid={props.inputErrors.host.length > 0}
          >
            <EuiCompressedFieldText
              placeholder="smtp.example.com"
              data-test-subj="create-sender-form-host-input"
              value={props.host}
              onChange={(e) => props.setHost(e.target.value)}
              isInvalid={props.inputErrors.host.length > 0}
              onBlur={() => {
                props.setInputErrors({
                  ...props.inputErrors,
                  host: validateHost(props.host),
                });
              }}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiCompressedFormRow
            label="Port"
            error={props.inputErrors.port.join(' ')}
            isInvalid={props.inputErrors.port.length > 0}
          >
            <EuiCompressedFieldNumber
              placeholder="465"
              data-test-subj="create-sender-form-port-input"
              value={props.port}
              onChange={(e) => props.setPort(e.target.value)}
              isInvalid={props.inputErrors.port.length > 0}
              onBlur={() => {
                props.setInputErrors({
                  ...props.inputErrors,
                  port: validatePort(props.port),
                });
              }}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />
      <EuiCompressedFormRow
        label="Encryption method"
        style={{ maxWidth: '650px' }}
        helpText={
          <div>
            SSL/TLS or STARTTLS is recommended for security. To use either one, you must
            enter each sender account's credentials to the OpenSearch
            keystore using the CLI.{' '}
            <EuiLink
              href={ALERTING_DOCUMENTATION_LINK}
              target="_blank"
              external
            >
              Learn more
            </EuiLink>
          </div>
        }
      >
        <EuiCompressedSuperSelect
          fullWidth
          data-test-subj="create-sender-form-encryption-input"
          options={encryptionOptions}
          valueOfSelected={props.encryption}
          onChange={props.setEncryption}
        />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />
    </>
  );
}
