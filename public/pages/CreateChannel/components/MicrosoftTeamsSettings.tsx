/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFieldText, EuiCompressedFormRow } from '@elastic/eui';
import React, { useContext } from 'react';
import { CreateChannelContext } from '../CreateChannel';
import { validateWebhookURL } from '../utils/validationHelper';

interface MicrosoftTeamsSettingsProps {
  microsoftTeamsWebhook: string;
  setMicrosoftTeamsWebhook: (url: string) => void;
}

export function MicrosoftTeamsSettings(props: MicrosoftTeamsSettingsProps) {
  const context = useContext(CreateChannelContext)!;

  return (
    <EuiCompressedFormRow
      label="Webhook URL"
      style={{ maxWidth: '700px' }}
      error={context.inputErrors.microsoftTeamsWebhook.join(' ')}
      isInvalid={context.inputErrors.microsoftTeamsWebhook.length > 0}
    >
      <EuiCompressedFieldText
        fullWidth
        data-test-subj="create-channel-microsoftTeams-webhook-input"
        placeholder="https://xxxxx.webhook.office.com/webhookb2/xxxxx/IncomingWebhook/xxxxx..."
        value={props.microsoftTeamsWebhook}
        onChange={(e) => props.setMicrosoftTeamsWebhook(e.target.value)}
        isInvalid={context.inputErrors.microsoftTeamsWebhook.length > 0}
        onBlur={() => {
          context.setInputErrors({
            ...context.inputErrors,
            microsoftTeamsWebhook: validateWebhookURL(props.microsoftTeamsWebhook),
          });
        }}
      />
    </EuiCompressedFormRow>
  );
}
