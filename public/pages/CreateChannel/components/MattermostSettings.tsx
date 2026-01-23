/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFieldText, EuiCompressedFormRow } from '@elastic/eui';
import React, { useContext } from 'react';
import { CreateChannelContext } from '../CreateChannel';
import { validateWebhookURL } from '../utils/validationHelper';

interface MattermostSettingsProps {
  mattermostWebhook: string;
  setMattermostWebhook: (url: string) => void;
}

export function MattermostSettings(props: MattermostSettingsProps) {
  const context = useContext(CreateChannelContext)!;

  return (
    <EuiCompressedFormRow
      label="Mattermost webhook URL"
      style={{ maxWidth: '700px' }}
      error={context.inputErrors.mattermostWebhook.join(' ')}
      isInvalid={context.inputErrors.mattermostWebhook.length > 0}
    >
      <EuiCompressedFieldText
        fullWidth
        data-test-subj="create-channel-mattermost-webhook-input"
        placeholder="https://your-mattermost-server.com/hooks/xxx-generatedkey-xxx"
        value={props.mattermostWebhook}
        onChange={(e) => props.setMattermostWebhook(e.target.value)}
        isInvalid={context.inputErrors.mattermostWebhook.length > 0}
        onBlur={() => {
          context.setInputErrors({
            ...context.inputErrors,
            mattermostWebhook: validateWebhookURL(props.mattermostWebhook),
          });
        }}
      />
    </EuiCompressedFormRow>
  );
}
