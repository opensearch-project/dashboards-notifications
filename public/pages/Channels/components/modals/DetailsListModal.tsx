/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiHorizontalRule,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';

interface DetailsListModalProps extends ModalRootProps {
  header: string;
  title: string;
  items: string[];
  onClose: () => void;
}

export function DetailsListModal(props: DetailsListModalProps) {
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
            <EuiTitle size="xxs">
              <h1>{props.title}</h1>
            </EuiTitle>
            {props.items.map((item, i) => {
              return (
                <div key={`details-list-modal-item-${i}`}>
                  <EuiHorizontalRule margin="s" />
                  <p>{item}</p>
                </div>
              );
            })}
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
