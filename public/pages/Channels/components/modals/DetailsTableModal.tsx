/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiInMemoryTable,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiTableFieldDataColumnType,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';
import { HeaderItemType } from '../../types';

interface DetailsTableModalProps extends ModalRootProps {
  header: string;
  isParameters: boolean; // headers or parameters
  items: HeaderItemType[];
  onClose: () => void;
}

export function DetailsTableModal(props: DetailsTableModalProps) {
  const keyColumn = props.isParameters ? 'Parameter' : 'Header';
  const columns = [
    {
      field: 'key',
      name: keyColumn,
      align: 'left',
      truncateText: false,
      render: (item) => (item ? item : '-'),
    },
    {
      field: 'value',
      name: 'Value',
      align: 'left',
      truncateText: false,
      render: (item) => (item ? item : '-'),
    },
  ] as Array<EuiTableFieldDataColumnType<HeaderItemType>>;

  return (
    <>
      <EuiOverlayMask>
        <EuiModal onClose={props.onClose} maxWidth={800}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <EuiText size="s">
                <h2>{props.header}</h2>
              </EuiText>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiInMemoryTable items={props.items} columns={columns} />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiSmallButton fill onClick={props.onClose}>
              Close
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    </>
  );
}
