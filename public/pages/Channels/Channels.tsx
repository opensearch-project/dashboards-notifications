/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTable,
  EuiSmallButton,
  EuiEmptyPrompt,
  EuiHealth,
  EuiHorizontalRule,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiTableSortingType,
  SortDirection,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import _ from 'lodash';
import React, { Component, useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ChannelItemType, TableState } from '../../../models/interfaces';
import {
  ContentPanel,
  ContentPanelActions,
} from '../../components/ContentPanel';
import { CoreServicesContext } from '../../components/coreServices';
import { NotificationService } from '../../services';
import {
  BREADCRUMBS,
  ROUTES,
} from '../../utils/constants';
import {
  CHANNEL_TYPE,
} from '../../../common/constants';
import { getErrorMessage } from '../../utils/helpers';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../Notifications/utils/constants';
import { ChannelActions } from './components/ChannelActions';
import { ChannelControls } from './components/ChannelControls';
import { ChannelFiltersType } from './types';
import { DataSourceMenuProperties } from '../../services/DataSourceMenuContext';
import MDSEnabledComponent, {
  isDataSourceChanged,
  isDataSourceError,
} from '../../components/MDSEnabledComponent/MDSEnabledComponent';

interface ChannelsProps extends RouteComponentProps, DataSourceMenuProperties {
  notificationService: NotificationService;
}

interface ChannelsState extends TableState<ChannelItemType>, DataSourceMenuProperties {
  filters: ChannelFiltersType;
}

export class Channels extends MDSEnabledComponent<ChannelsProps, ChannelsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<ChannelItemType>[];

  constructor(props: ChannelsProps) {
    super(props);
    const state: ChannelsState = {
      total: 0,
      from: 0,
      size: 10,
      search: '',
      filters: {},
      sortField: 'name',
      sortDirection: SortDirection.ASC,
      items: [],
      selectedItems: [],
      loading: true,
    };

    this.state = state;

    this.columns = [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        truncateText: true,
        render: (name: string, item: ChannelItemType) => (
          <EuiLink href={`#${ROUTES.CHANNEL_DETAILS}/${item.config_id}`}>
            {name}
          </EuiLink>
        ),
      },
      {
        field: 'is_enabled',
        name: 'Notification status',
        sortable: true,
        render: (enabled: boolean) => {
          const color = enabled ? 'success' : 'subdued';
          const label = enabled ? 'Active' : 'Muted';
          return <EuiHealth color={color}>{label}</EuiHealth>;
        },
      },
      {
        field: 'config_type',
        name: 'Type',
        sortable: true,
        truncateText: false,
        render: (type: string) => _.get(CHANNEL_TYPE, type, '-'),
      },
      {
        field: 'description',
        name: 'Description',
        sortable: true,
        truncateText: true,
        render: (description: string) => description || '-',
      },
    ];

    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.CHANNELS,
    ]);
    window.scrollTo(0, 0);
    await this.refresh();
  }

  async componentDidUpdate(prevProps: ChannelsProps, prevState: ChannelsState) {
    const prevQuery = this.getQueryObjectFromState(prevState);
    const currQuery = this.getQueryObjectFromState(this.state);

    if (!_.isEqual(prevQuery, currQuery)) {
      await this.refresh();
    }
    if (isDataSourceChanged(this.props, prevProps)) {
      await this.refresh();
    }
  }

  getQueryObjectFromState(state: ChannelsState) {
    const config_type = _.isEmpty(state.filters.type)
      ? Object.keys(CHANNEL_TYPE) // by default get all channels but not email senders/groups
      : state.filters.type;
    const queryObject: any = {
      from_index: state.from,
      max_items: state.size,
      query: state.search,
      config_type,
      sort_field: state.sortField,
      sort_order: state.sortDirection,
    };
    if (state.filters.state != undefined)
      queryObject.is_enabled = state.filters.state;
    return queryObject;
  }

  async refresh() {
    this.setState({ loading: true });
    try {
      const queryObject = this.getQueryObjectFromState(this.state);
      const channels = await this.props.notificationService.getChannels(
        queryObject
      );
      this.setState({ items: channels.items, total: channels.total });
    } catch (error) {
      if (isDataSourceError(error)) {
        this.setState({ items: [], total: 0 });
      }
      this.context.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading channels.')
      );
    }
    this.setState({ loading: false });
  }

  onTableChange = ({
    page: tablePage,
    sort,
  }: Criteria<ChannelItemType>): void => {
    const { index: page, size } = tablePage!;
    const { field: sortField, direction: sortDirection } = sort!;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ChannelItemType[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (search: string): void => {
    this.setState({ from: 0, search });
  };

  onFiltersChange = (filters: ChannelFiltersType): void => {
    this.setState({ from: 0, filters });
  };

  render() {
    const filterIsApplied = !!this.state.search;
    const page = Math.floor(this.state.from / this.state.size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: this.state.size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: this.state.total,
    };

    const sorting: EuiTableSortingType<ChannelItemType> = {
      sort: {
        direction: this.state.sortDirection,
        field: this.state.sortField,
      },
    };

    const selection = {
      selectable: () => true,
      onSelectionChange: this.onSelectionChange,
    };

    return (
      <>
        <ContentPanel
          actions={
            <ContentPanelActions
              actions={[
                {
                  component: (
                    <ChannelActions
                      selected={this.state.selectedItems}
                      setSelected={(selectedItems: ChannelItemType[]) =>
                        this.setState({ selectedItems })
                      }
                      items={this.state.items}
                      setItems={(items: ChannelItemType[]) =>
                        this.setState({ items })
                      }
                      refresh={this.refresh}
                    />
                  ),
                },
                {
                  component: (
                    <EuiSmallButton fill href={`#${ROUTES.CREATE_CHANNEL}`}>
                      Create channel
                    </EuiSmallButton>
                  ),
                },
              ]}
            />
          }
          bodyStyles={{ padding: 'initial' }}
          title="Channels"
          titleSize="m"
          total={this.state.total}
        >
          <ChannelControls
            onSearchChange={this.onSearchChange}
            filters={this.state.filters}
            onFiltersChange={this.onFiltersChange}
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
                title={<h2>No channels to display</h2>}
                body="To send or receive notifications, you will need to create a notification channel."
                actions={
                  <EuiSmallButton href={`#${ROUTES.CREATE_CHANNEL}`}>
                    Create channel
                  </EuiSmallButton>
                }
              />
            }
            onChange={this.onTableChange}
            pagination={pagination}
            sorting={sorting}
            tableLayout="auto"
            loading={this.state.loading}
          />
        </ContentPanel>
      </>
    );
  }
}
