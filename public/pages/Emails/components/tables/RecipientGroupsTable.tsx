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
  EuiLink,
  EuiPopover,
  EuiTableFieldDataColumnType,
  EuiTableSortingType,
  EuiTitle,
  SortDirection,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import _ from 'lodash';
import React, { Component } from 'react';
import { CoreStart } from '../../../../../../../src/core/public';
import {
  RecipientGroupItemType,
  TableState,
} from '../../../../../models/interfaces';
import {
  ContentPanel,
  ContentPanelActions,
} from '../../../../components/ContentPanel';
import { ModalConsumer } from '../../../../components/Modal';
import { NotificationService, ServicesContext } from '../../../../services';
import { ROUTES } from '../../../../utils/constants';
import { getErrorMessage } from '../../../../utils/helpers';
import { DetailsListModal } from '../../../Channels/components/modals/DetailsListModal';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../Notifications/utils/constants';
import { DeleteRecipientGroupModal } from '../modals/DeleteRecipientGroupModal';
import {
  isDataSourceError,
  isDataSourceChanged,
} from '../../../../components/MDSEnabledComponent/MDSEnabledComponent';
import { TopNavControlButtonData } from 'src/plugins/navigation/public';
import { getUseUpdatedUx } from '../../../../../public/services/utils/constants';
import PageHeader from '../../../../../public/components/PageHeader/PageHeader';

interface RecipientGroupsTableProps {
  coreContext: CoreStart;
  notificationService: NotificationService;
}

interface RecipientGroupsTableState
  extends TableState<RecipientGroupItemType> { }

export class RecipientGroupsTable extends Component<
  RecipientGroupsTableProps,
  RecipientGroupsTableState
> {
  static contextType = ServicesContext;
  columns: EuiTableFieldDataColumnType<RecipientGroupItemType>[];

  constructor(props: RecipientGroupsTableProps) {
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
    };

    this.columns = [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        truncateText: true,
        width: '150px',
      },
      {
        field: 'email_group.recipient_list',
        name: 'Email addresses',
        sortable: true,
        truncateText: true,
        width: '450px',
        render: (
          recipient_list: RecipientGroupItemType['email_group']['recipient_list']
        ) => {
          const emails = recipient_list.map((recipient) => recipient.recipient);
          return (
            <div>
              {emails.slice(0, 5).join(', ')}
              {emails.length > 5 && (
                <span>
                  {' '}
                  <ModalConsumer>
                    {({ onShow }) => (
                      <EuiLink
                        onClick={() =>
                          onShow(DetailsListModal, {
                            header: `Email addresses (${emails.length})`,
                            title: 'Email addresses',
                            items: emails,
                          })
                        }
                      >
                        {emails.length - 5} more
                      </EuiLink>
                    )}
                  </ModalConsumer>
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: 'description',
        name: 'Description',
        sortable: true,
        truncateText: true,
        width: '300px',
        render: (description: string) => description || '-',
      },
    ];
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
  }

  async componentDidUpdate(
    prevProps: RecipientGroupsTableProps,
    prevState: RecipientGroupsTableState
  ) {
    const prevQuery = RecipientGroupsTable.getQueryObjectFromState(prevState);
    const currQuery = RecipientGroupsTable.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.refresh();
    }
    if (isDataSourceChanged(this.props, prevProps)) {
      await this.refresh();
    }
  }

  static getQueryObjectFromState(state: RecipientGroupsTableState) {
    return {
      from_index: state.from,
      max_items: state.size,
      query: state.search,
      config_type: 'email_group',
      sort_field: state.sortField,
      sort_order: state.sortDirection,
    };
  }

  async refresh() {
    this.setState({ loading: true });
    try {
      const queryObject = RecipientGroupsTable.getQueryObjectFromState(
        this.state
      );
      const recipientGroups = await this.context.notificationService.getRecipientGroups(
        queryObject
      );
      this.setState({
        items: recipientGroups.items,
        total: recipientGroups.total,
      });
    } catch (error) {
      if (isDataSourceError(error)) {
        this.setState({ items: [], total: 0 });
      }
      this.props.coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading recipient groups.')
      );
    }
    this.setState({ loading: false });
  }

  onTableChange = ({
    page: tablePage,
    sort,
  }: Criteria<RecipientGroupItemType>): void => {
    const { index: page, size } = tablePage!;
    const { field: sortField, direction: sortDirection } = sort!;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: RecipientGroupItemType[]): void => {
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

    const sorting: EuiTableSortingType<RecipientGroupItemType> = {
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
          location.assign(`#${ROUTES.EDIT_RECIPIENT_GROUP}/${this.state.selectedItems[0]?.config_id}`);
        },
      },
      {
        label: 'Delete',
        disabled: this.state.selectedItems.length === 0,
        modal: DeleteRecipientGroupModal,
        modalParams: {
          recipientGroups: this.state.selectedItems,
          refresh: this.refresh,
        },
      },
    ];

    const headerControls = [
      {
        id: 'Create recipient group',
        label: 'Create recipient group',
        iconType: 'plus',
        fill: true,
        href: `#${ROUTES.CREATE_RECIPIENT_GROUP}`,
        testId: 'createButton',
        controlType: 'button',
      } as TopNavControlButtonData,
    ];

    const totalEmailGroups = (
      <EuiTitle size="m">
        <h2>({this.state.total})</h2>
      </EuiTitle>
    )

    const searchComponent = <EuiCompressedFieldSearch
      data-test-subj="recipient-groups-table-search-input"
      fullWidth={true}
      placeholder="Search"
      onSearch={this.onSearchChange} />;

    const createRecepientButton = <EuiSmallButton fill href={`#${ROUTES.CREATE_RECIPIENT_GROUP}`}>
      Create recipient group
    </EuiSmallButton>;

    const tableComponent = <EuiBasicTable
      columns={this.columns}
      items={this.state.items}
      itemId="config_id"
      isSelectable={true}
      selection={selection}
      noItemsMessage={<EuiEmptyPrompt
        title={<h2>No recipient groups to display</h2>}
        body="Use an email group to manage a list of email addresses you frequently send at a time. You can select recipient groups when configuring email channels."
        actions={<EuiSmallButton href={`#${ROUTES.CREATE_RECIPIENT_GROUP}`}>
          Create recipient group
        </EuiSmallButton>} />}
      onChange={this.onTableChange}
      pagination={pagination}
      sorting={sorting} />;

    return (
      <>
        {getUseUpdatedUx() ? (
          <>
            <PageHeader
              appRightControls={headerControls}
              appLeftControls={[{ renderComponent: totalEmailGroups }]}
            />
            <ContentPanel>
              <EuiFlexGroup>
                <EuiFlexItem>
                  {searchComponent}
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
              {tableComponent}
            </ContentPanel>
          </>
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
                            data-test-subj="recipient-groups-table-delete-button"
                            disabled={this.state.selectedItems.length === 0}
                            onClick={() =>
                              onShow(DeleteRecipientGroupModal, {
                                recipientGroups: this.state.selectedItems,
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
                        data-test-subj="recipient-groups-table-edit-button"
                        disabled={this.state.selectedItems.length !== 1}
                        onClick={() =>
                          location.assign(
                            `#${ROUTES.EDIT_RECIPIENT_GROUP}/${this.state.selectedItems[0]?.config_id}`
                          )
                        }
                      >
                        Edit
                      </EuiSmallButton>
                    ),
                  },
                  {
                    component: createRecepientButton,
                  },
                ]}
              />
            }
            bodyStyles={{ padding: 'initial' }}
            title="Recipient groups"
            titleSize="m"
            total={this.state.total}
          >
            {searchComponent}
            <EuiHorizontalRule margin="s" />
            {tableComponent}
          </ContentPanel>
        )}
      </>

    );
  }
};
