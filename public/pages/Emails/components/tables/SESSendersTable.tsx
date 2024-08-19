/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTable,
  EuiSmallButton,
  EuiContextMenuItem,
  EuiEmptyPrompt,
  EuiCompressedFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPopover,
  EuiTableFieldDataColumnType,
  EuiTableSortingType,
  SortDirection,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import _ from 'lodash';
import React, { Component } from 'react';
import { CoreStart } from '../../../../../../../src/core/public';
import {
  SESSenderItemType,
  TableState,
} from '../../../../../models/interfaces';
import {
  ContentPanel, ContentPanelActions,
} from '../../../../components/ContentPanel';
import { ModalConsumer } from '../../../../components/Modal';
import { NotificationService, ServicesContext } from '../../../../services';
import { ROUTES } from '../../../../utils/constants';
import { getErrorMessage } from '../../../../utils/helpers';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../Notifications/utils/constants';
import { DeleteSenderModal } from '../modals/DeleteSenderModal';
import {
  isDataSourceError,
  isDataSourceChanged,
} from '../../../../components/MDSEnabledComponent/MDSEnabledComponent';
import { getUseUpdatedUx } from '../../../../../public/services/utils/constants';

interface SESSendersTableProps {
  coreContext: CoreStart;
  notificationService: NotificationService;
}

interface SESSendersTableState extends TableState<SESSenderItemType> { }

export class SESSendersTable extends Component<
  SESSendersTableProps,
  SESSendersTableState
> {
  static contextType = ServicesContext;
  columns: EuiTableFieldDataColumnType<SESSenderItemType>[];

  constructor(props: SESSendersTableProps) {
    super(props);
    this.state = {
      total: 0,
      from: 0,
      size: 5,
      search: '',
      sortField: 'name',
      sortDirection: SortDirection.ASC,
      items: [],
      selectedItems: [],
      loading: true,
      isPopoverOpen: false, // Initialize popover state
    };

    this.columns = [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        truncateText: true,
        width: '200px',
      },
      {
        field: 'ses_account.from_address',
        name: 'Outbound email address',
        sortable: true,
        truncateText: true,
      },
      {
        field: 'ses_account.region',
        name: 'AWS region',
        sortable: true,
        truncateText: true,
      },
      {
        field: 'ses_account.role_arn',
        name: 'Role ARN',
        sortable: false,
        truncateText: true,
      },
    ];
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
  }

  async componentDidUpdate(
    prevProps: SESSendersTableProps,
    prevState: SESSendersTableState
  ) {
    const prevQuery = SESSendersTable.getQueryObjectFromState(prevState);
    const currQuery = SESSendersTable.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.refresh();
    }
    if (isDataSourceChanged(this.props, prevProps)) {
      await this.refresh();
    }
  }

  static getQueryObjectFromState(state: SESSendersTableState) {
    return {
      from_index: state.from,
      max_items: state.size,
      query: state.search,
      config_type: 'ses_account',
      sort_field: state.sortField,
      sort_order: state.sortDirection,
    };
  }

  async refresh() {
    this.setState({ loading: true });
    try {
      const queryObject = SESSendersTable.getQueryObjectFromState(this.state);
      const senders = await this.context.notificationService.getSESSenders(
        queryObject
      );
      this.setState({ items: senders.items, total: senders.total });
    } catch (error) {
      if (isDataSourceError(error)) {
        this.setState({ items: [], total: 0 });
      }
      this.props.coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading SES senders.')
      );
    }
    this.setState({ loading: false });
  }

  onTableChange = ({
    page: tablePage,
    sort,
  }: Criteria<SESSenderItemType>): void => {
    const { index: page, size } = tablePage!;
    const { field: sortField, direction: sortDirection } = sort!;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: SESSenderItemType[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (search: string): void => {
    this.setState({ from: 0, search });
  };

  togglePopover = () => {
    this.setState((prevState) => ({
      isPopoverOpen: !prevState.isPopoverOpen,
    }));
  };

  render() {
    const page = Math.floor(this.state.from / this.state.size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: this.state.size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: this.state.total,
    };

    const sorting: EuiTableSortingType<SESSenderItemType> = {
      sort: {
        direction: this.state.sortDirection,
        field: this.state.sortField,
      },
    };

    const selection = {
      selectable: () => true,
      onSelectionChange: this.onSelectionChange,
    };

    const actions = [
      {
        label: 'Edit',
        disabled: this.state.selectedItems.length !== 1,
        action: () => {
          location.assign(`#${ROUTES.EDIT_SES_SENDER}/${this.state.selectedItems[0]?.config_id}`);
        },
      },
      {
        label: 'Delete',
        disabled: this.state.selectedItems.length === 0,
        modal: DeleteSenderModal,
        modalParams: {
          senders: this.state.selectedItems,
          refresh: this.refresh,
        },
      },
    ];

    return (
      <>
        {getUseUpdatedUx() ? (
          <ContentPanel
            actions={
              <ContentPanelActions
                actions={[
                  {
                    component: (
                      <EuiSmallButton fill href={`#${ROUTES.CREATE_SES_SENDER}`} iconType='plus'>
                        Create SES sender
                      </EuiSmallButton>
                    ),
                  },
                ]}
              />
            }
            bodyStyles={{ padding: 'initial' }}
            title="SES senders"
            titleSize="m"
            total={this.state.total}
          >
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiCompressedFieldSearch
                  data-test-subj="ses-senders-table-search-input"
                  fullWidth={true}
                  placeholder="Search"
                  onSearch={this.onSearchChange}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  panelPaddingSize="none"
                  button={
                    <EuiSmallButton
                      iconType="arrowDown"
                      iconSide="right"
                      onClick={this.togglePopover}
                      style={{ marginLeft: '10px' }} // Ensure spacing is correct
                    >
                      Actions
                    </EuiSmallButton>
                  }
                  isOpen={this.state.isPopoverOpen}
                  closePopover={() => this.setState({ isPopoverOpen: false })}
                >
                  {actions.map((action) => (
                    <ModalConsumer key={action.label}>
                      {({ onShow }) => (
                        <EuiContextMenuItem
                          key={action.label}
                          disabled={action.disabled}
                          onClick={() => {
                            this.setState({ isPopoverOpen: false });
                            if (action.modal) {
                              onShow(action.modal, {
                                ...(action.modalParams || {}),
                              });
                            } else if (action.action) {
                              action.action();
                            }
                          }}
                        >
                          {action.label}
                        </EuiContextMenuItem>
                      )}
                    </ModalConsumer>
                  ))}
                </EuiPopover>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiHorizontalRule margin="s" />

            <EuiBasicTable
              columns={this.columns}
              items={this.state.items}
              itemId="config_id"
              isSelectable={true}
              selection={selection}
              noItemsMessage={
                <EuiEmptyPrompt
                  title={<h2>No SES senders to display</h2>}
                  body="Set up an outbound email server by creating a sender. You will select a sender when configuring email channels."
                  actions={
                    <EuiSmallButton href={`#${ROUTES.CREATE_SES_SENDER}`}>
                      Create SES sender
                    </EuiSmallButton>
                  }
                />
              }
              onChange={this.onTableChange}
              pagination={pagination}
              sorting={sorting}
              loading={this.state.loading}
              tableLayout="auto"
            />
          </ContentPanel>
        ) : (
          <ContentPanel
            actions={
              <ContentPanelActions
                actions={[
                  {
                    component: (
                      <ModalConsumer>
                        {({ onShow }) => (
                          <EuiSmallButton
                            data-test-subj="ses-senders-table-delete-button"
                            disabled={this.state.selectedItems.length === 0}
                            onClick={() =>
                              onShow(DeleteSenderModal, {
                                senders: this.state.selectedItems,
                                refresh: this.refresh,
                              })
                            }
                          >
                            Delete
                          </EuiSmallButton>
                        )}
                      </ModalConsumer>
                    ),
                  },
                  {
                    component: (
                      <EuiSmallButton
                        data-test-subj="ses-senders-table-edit-button"
                        disabled={this.state.selectedItems.length !== 1}
                        onClick={() =>
                          location.assign(
                            `#${ROUTES.EDIT_SES_SENDER}/${this.state.selectedItems[0]?.config_id}`
                          )
                        }
                      >
                        Edit
                      </EuiSmallButton>
                    ),
                  },
                  {
                    component: (
                      <EuiSmallButton fill href={`#${ROUTES.CREATE_SES_SENDER}`}>
                        Create SES sender
                      </EuiSmallButton>
                    ),
                  },
                ]}
              />
            }
            bodyStyles={{ padding: 'initial' }}
            title="SES senders"
            titleSize="m"
            total={this.state.total}
          >
            <EuiCompressedFieldSearch
              data-test-subj="ses-senders-table-search-input"
              fullWidth={true}
              placeholder="Search"
              onSearch={this.onSearchChange}
            />
            <EuiHorizontalRule margin="s" />

            <EuiBasicTable
              columns={this.columns}
              items={this.state.items}
              itemId="config_id"
              isSelectable={true}
              selection={selection}
              noItemsMessage={
                <EuiEmptyPrompt
                  title={<h2>No SES senders to display</h2>}
                  body="Set up an outbound email server by creating a sender. You will select a sender when configuring email channels."
                  actions={
                    <EuiSmallButton href={`#${ROUTES.CREATE_SES_SENDER}`}>
                      Create SES sender
                    </EuiSmallButton>
                  }
                />
              }
              onChange={this.onTableChange}
              pagination={pagination}
              sorting={sorting}
              loading={this.state.loading}
              tableLayout="auto"
            />
          </ContentPanel>

        )}
      </>
    );

  }
};
