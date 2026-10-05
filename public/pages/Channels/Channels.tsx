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
  EuiTitle,
  SortDirection,
  EuiText,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import _ from 'lodash';
import React from 'react';
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
  setBreadcrumbs,
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
import PageHeader from "../../components/PageHeader/PageHeader"
import { getUseUpdatedUx } from '../../services/utils/constants';
import {
  getResourceSharingAvailableTypes,
  NOTIFICATION_CONFIG_RESOURCE_TYPE,
} from '../../services/utils/resource_sharing';
import { TopNavControlButtonData } from 'src/plugins/navigation/public';

interface ChannelsProps extends RouteComponentProps, DataSourceMenuProperties {
  notificationService: NotificationService;
}

interface ChannelsState extends TableState<ChannelItemType>, DataSourceMenuProperties {
  filters: ChannelFiltersType;
  resourceSharing: { dataSourceId: string | undefined; types: string[] };
}

export class Channels extends MDSEnabledComponent<ChannelsProps, ChannelsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<ChannelItemType>[];
  accessColumn: EuiTableFieldDataColumnType<ChannelItemType>;

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
      resourceSharing: { dataSourceId: undefined, types: [] },
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

    this.accessColumn = {
      // Resource-sharing SPI marker column: the centralized Share
      // button is mounted here by security-dashboards-plugin when
      // installed and resource sharing is enabled for notification
      // configs on the selected data source.
      field: 'config_id',
      name: 'Access',
      sortable: false,
      width: '5%',
      render: (configId: string, item: ChannelItemType) =>
        this.state.resourceSharing.dataSourceId ===
          this.props.notificationService.dataSourceId &&
        this.state.resourceSharing.types.includes(
          NOTIFICATION_CONFIG_RESOURCE_TYPE
        ) ? (
          <div
            data-resource-share-button
            data-resource-id={configId}
            data-resource-type={NOTIFICATION_CONFIG_RESOURCE_TYPE}
            {...(item?.name ? { 'data-resource-name': item.name } : {})}
            data-resource-share-display="icon"
          />
        ) : null,
    };

    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.CHANNELS,
    ]);
    window.scrollTo(0, 0);
    this.updateResourceSharingAvailableTypes();
    await this.refresh();
  }

  async componentDidUpdate(prevProps: ChannelsProps, prevState: ChannelsState) {
    const prevQuery = this.getQueryObjectFromState(prevState);
    const currQuery = this.getQueryObjectFromState(this.state);

    if (!_.isEqual(prevQuery, currQuery)) {
      await this.refresh();
    }
    if (isDataSourceChanged(this.props, prevProps)) {
      this.updateResourceSharingAvailableTypes();
      await this.refresh();
    }
  }

  async updateResourceSharingAvailableTypes() {
    // Capture which data source this probe is for so a late-resolving call
    // (e.g. from a data source the user has since switched away from) can't
    // overwrite state with a result that no longer matches the current
    // selection.
    const requestedDataSourceId = this.props.notificationService.dataSourceId;
    const types = await getResourceSharingAvailableTypes(requestedDataSourceId);
    if (requestedDataSourceId === this.props.notificationService.dataSourceId) {
      this.setState({
        resourceSharing: { dataSourceId: requestedDataSourceId, types },
      });
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

    const columns =
      this.state.resourceSharing.dataSourceId === this.props.notificationService.dataSourceId &&
      this.state.resourceSharing.types.includes(NOTIFICATION_CONFIG_RESOURCE_TYPE)
        ? [...this.columns, this.accessColumn]
        : this.columns;

    const headerControls = [
      {
        id: 'Create Channel',
        label: 'Create channel',
        iconType: 'plus',
        fill: true,
        href: `#${ROUTES.CREATE_CHANNEL}`,
        testId: 'createButton',
        controlType: 'button',
      } as TopNavControlButtonData,
    ];

    const totalChannels = (
      <EuiTitle size="m">
        <h2>({this.state.total})</h2>
      </EuiTitle>
    )

    const channelActionsComponent = <ChannelActions
      selected={this.state.selectedItems}
      setSelected={(selectedItems: ChannelItemType[]) => this.setState({ selectedItems })}
      items={this.state.items}
      setItems={(items: ChannelItemType[]) => this.setState({ items })}
      refresh={this.refresh} />;

    const channelControlsComponent = <ChannelControls
      onSearchChange={this.onSearchChange}
      filters={this.state.filters}
      onFiltersChange={this.onFiltersChange} />;

    const basicTableComponent = <EuiBasicTable
      columns={columns}
      items={this.state.items}
      itemId="config_id"
      isSelectable={true}
      selection={selection}
      noItemsMessage={<EuiEmptyPrompt
        title={<EuiText size="s"><h2>No channels to display</h2></EuiText>}
        body={<EuiText size="s">"To send or receive notifications, you will need to create a notification channel."</EuiText>}
        actions={<EuiSmallButton href={`#${ROUTES.CREATE_CHANNEL}`}>
          Create channel
        </EuiSmallButton>} />}
      onChange={this.onTableChange}
      pagination={pagination}
      sorting={sorting}
      tableLayout="auto"
      loading={this.state.loading} />;

    return (
      <>
      {getUseUpdatedUx() ? (
        <>
          <PageHeader
            appRightControls={headerControls}
            appLeftControls={[{ renderComponent: totalChannels }]}
          />
          <ContentPanel panelStyles={{ padding: this.state.total < 1? '16px 16px 0px' : '16px' }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {channelControlsComponent}
                <div style={{ marginLeft: '16px' }}>
                  {channelActionsComponent}
                </div>
              </div>
            </div>
            <EuiHorizontalRule margin="s" />
            {basicTableComponent}
          </ContentPanel>
        </>
      ) : (
        <ContentPanel
          actions={
            <ContentPanelActions
              actions={[
                {
                  component: channelActionsComponent,
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
          titleSize="s"
          total={this.state.total}
        >
          {channelControlsComponent}
          <EuiHorizontalRule margin="s" />
          {basicTableComponent}
        </ContentPanel>
      )}
    </>

    );
  }
};

