/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';

interface ContentPanelProps {
  title?: string;
  titleSize?: 'xs' | 's' | 'm';
  total?: number;
  bodyStyles?: object;
  panelStyles?: object;
  horizontalRuleClassName?: string;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}

const ContentPanel: React.SFC<ContentPanelProps> = ({
  title = '',
  titleSize = 's',
  total = undefined,
  bodyStyles = {},
  panelStyles = {},
  horizontalRuleClassName = '',
  actions,
  children,
}) => (
  <EuiPanel style={{ ...panelStyles }}>
    <EuiFlexGroup
      style={{ padding: '0px 0px' }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        <EuiTitle size={titleSize}>
          <h2>
            {title}
            {total !== undefined ? (
              <span
                style={{ color: '#9f9f9f', fontWeight: 300 }}
              >{` (${total})`}</span>
            ) : null}
          </h2>
        </EuiTitle>
      </EuiFlexItem>
      {actions ? (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {Array.isArray(actions) ? (
              (actions as React.ReactNode[]).map(
                (action: React.ReactNode, idx: number): React.ReactNode => (
                  <EuiFlexItem key={idx}>{action}</EuiFlexItem>
                )
              )
            ) : (
              <EuiFlexItem>{actions}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    <EuiHorizontalRule margin="s" className={horizontalRuleClassName} />

    <div style={{ padding: '0px', ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

export default ContentPanel;
