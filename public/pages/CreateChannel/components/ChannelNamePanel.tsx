/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFieldText, EuiFormRow, EuiTextArea } from '@elastic/eui';
import React, { useContext } from 'react';
import { ContentPanel } from '../../../components/ContentPanel';
import { CreateChannelContext } from '../CreateChannel';
import { validateChannelName } from '../utils/validationHelper';
import { i18n } from '@osd/i18n';

interface ChannelNamePanelProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export function ChannelNamePanel(props: ChannelNamePanelProps) {
  const context = useContext(CreateChannelContext)!;
  return (
    <>
      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title={
          i18n.translate('notification.notificationChannels.nameAndDescription', {
          defaultMessage:
          "Name and description",
          })}
        
        titleSize="s"
      >
        <EuiFormRow
          label={
            i18n.translate('notification.notificationChannels.newChannelName', {
            defaultMessage:
              'Name',
            })}
          
          error={context.inputErrors.name.join(' ')}
          isInvalid={context.inputErrors.name.length > 0}
        >
          <EuiFieldText
            data-test-subj="create-channel-name-input"
            placeholder={
              i18n.translate('notification.notificationChannels.newChannelPlaceholder', {
              defaultMessage:
                "Enter channel name",
              })}
            
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            isInvalid={context.inputErrors.name.length > 0}
            onBlur={() => {
              context.setInputErrors({
                ...context.inputErrors,
                name: validateChannelName(props.name),
              });
            }}
          />
        </EuiFormRow>
        <EuiFormRow
          label={
            <span>
              {
              i18n.translate('notification.notificationChannels.newChannelDescription', {
              defaultMessage:
                "Description - ",
              })}
              <i style={{ fontWeight: 'normal' }}>{
                i18n.translate('notification.notificationChannels.newChannelDescriptionOptional', {
                defaultMessage:
                  'optional',
                })}
                </i>
            </span>
          }
        >
          <>
            <EuiTextArea
              data-test-subj="create-channel-description-input"
              placeholder={
                i18n.translate('notification.notificationChannels.newChannelPurpose', {
                defaultMessage:
                "What is the purpose of this channel?",
                })}
              
              style={{ height: '4.1rem' }}
              value={props.description}
              onChange={(e) => props.setDescription(e.target.value)}
            />
          </>
        </EuiFormRow>
      </ContentPanel>
    </>
  );
}
