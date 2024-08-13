/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiContextMenuItem, EuiPopover } from '@elastic/eui';
import React, { useState } from 'react';
import { ChannelItemType } from '../../../../models/interfaces';
import { ModalConsumer } from '../../../components/Modal';
import { ROUTES } from '../../../utils/constants';
import { DeleteChannelModal } from './modals/DeleteChannelModal';

interface ChannelActionsParams {
  label: string;
  disabled: boolean;
  modal?: React.ReactNode;
  modalParams?: object;
  href?: string;
  action?: () => void;
}

interface ChannelActionsProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  items: ChannelItemType[];
  setItems: (items: ChannelItemType[]) => void;
  refresh: () => void;
  href?: string;
}

export function ChannelActionsHeader(props: ChannelActionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const actions: ChannelActionsParams[] = [
    {
      label: 'Edit',
      disabled: props.selected.length !== 1,
      href: props.href,
    },
    {
      label: 'Delete',
      disabled: props.selected.length === 0,
      modal: DeleteChannelModal,
      modalParams: { refresh: props.refresh },
    },
  ];

  return (
    <ModalConsumer>
      {({ onShow }) => (
        <EuiPopover
          panelPaddingSize="none"
          button={
            <EuiButton
              iconType="arrowDown"
              iconSide="right"
              disabled={props.selected.length === 0}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              Actions
            </EuiButton>
          }
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
        >
          {actions.map((params) => (
            <EuiContextMenuItem
              key={params.label}
              disabled={params.disabled}
              onClick={() => {
                setIsPopoverOpen(false);
                if (params.modal) {
                  onShow(params.modal, {
                    selected: props.selected,
                    ...(params.modalParams || {}),
                  });
                }
                if (params.href) location.assign(params.href);
                if (params.action) params.action();
              }}
            >
              {params.label}
            </EuiContextMenuItem>
          ))}
        </EuiPopover>
      )}
    </ModalConsumer>
  );
}
