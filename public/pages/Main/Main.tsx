/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPage, EuiPageBody, EuiPageSideBar, EuiSideNav } from '@elastic/eui';
import React, { Component, createContext, useContext } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { CoreStart, SavedObject } from '../../../../../src/core/public';
import { CoreServicesConsumer, CoreServicesContext } from '../../components/coreServices';
import { ModalProvider, ModalRoot } from '../../components/Modal';
import { BrowserServices } from '../../models/interfaces';
import { ServicesConsumer, ServicesContext } from '../../services/services';
import { ROUTES } from '../../utils/constants';
import { CHANNEL_TYPE } from '../../../common/constants';
import { Channels } from '../Channels/Channels';
import { ChannelDetails } from '../Channels/components/details/ChannelDetails';
import { CreateChannel } from '../CreateChannel/CreateChannel';
import { CreateRecipientGroup } from '../Emails/CreateRecipientGroup';
import { CreateSender } from '../Emails/CreateSender';
import { CreateSESSender } from '../Emails/CreateSESSender';
import { EmailGroups } from '../Emails/EmailGroups';
import { EmailSenders } from '../Emails/EmailSenders';
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../services/DataSourceMenuContext";
import queryString from "query-string";
import {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
  DataSourceViewConfig,
} from "../../../../../src/plugins/data_source_management/public";
import { DataSourceOption } from "../../../../../src/plugins/data_source_management/public/components/data_source_menu/types";
import _ from "lodash";
import { NotificationService } from '../../services';
import { HttpSetup } from '../../../../../src/core/public';
import * as pluginManifest from "../../../opensearch_dashboards.json";
import { DataSourceAttributes } from "../../../../../src/plugins/data_source/common/data_sources";
import semver from "semver";

enum Navigation {
  Notifications = 'Notifications',
  Channels = 'Channels',
  EmailSenders = 'Email senders',
  EmailGroups = 'Email recipient groups',
}

enum Pathname {
  Channels = '/channels',
}

interface MainProps extends RouteComponentProps {
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  multiDataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
}

export interface MainState extends Pick<DataSourceMenuProperties, "dataSourceId" | "dataSourceLabel"> {
  availableChannels: Partial<typeof CHANNEL_TYPE>;
  availableConfigTypes: string[]; // available backend config types
  tooltipSupport: boolean; // if true, IAM role for SNS is optional and helper text should be available
  dataSourceReadOnly: boolean;
  dataSourceLoading: boolean;
  dataSourceLabel: string;
}

export const MainContext = createContext<MainState | null>(null);

export default class Main extends Component<MainProps, MainState> {
  static contextType = ServicesContext;
  constructor(props: MainProps) {
    super(props);
    const initialState = {
      availableChannels: CHANNEL_TYPE,
      availableConfigTypes: [],
      tooltipSupport: false,
    };

    if (props.multiDataSourceEnabled) {
      const {
        dataSourceId = "",
        dataSourceLabel = ""
      } = queryString.parse(this.props.location.search) as {
        dataSourceId?: string;
        dataSourceLabel?: string;
      };

      this.state = {
        ...initialState,
        dataSourceId: dataSourceId,
        dataSourceLabel: dataSourceLabel,
        dataSourceReadOnly: false,
        dataSourceLoading: props.multiDataSourceEnabled,
      };
    } else {
      this.state = initialState;
    }
  }

  async componentDidMount() {
    this.setServerFeatures();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.multiDataSourceEnabled && (prevState.dataSourceId !== this.state.dataSourceId)) {
      // Call setServerFeatures when dataSourceId is updated or dataSourceComponent is loaded
      this.setServerFeatures();
    }
  }

  async setServerFeatures() : Promise<void> {
    const services = this.getServices(this.props.http);
    const serverFeatures = await services.notificationService.getServerFeatures();
    const defaultConfigTypes = [
      'slack',
      'chime',
      'microsoft_teams',
      'webhook',
      'email',
      'sns',
      'smtp_account',
      'ses_account',
      'email_group',
    ];

    let newState = {
      dataSourceId: this.state.dataSourceId || '',
      dataSourceLabel: this.state.dataSourceLabel || '',
      dataSourceReadOnly: false,
      dataSourceLoading: this.state.dataSourceLoading,
      availableChannels: this.props.multiDataSourceEnabled ? CHANNEL_TYPE : defaultConfigTypes,
      availableConfigTypes: defaultConfigTypes,
      tooltipSupport: false,
    };

    if (serverFeatures) {
      const { availableChannels, availableConfigTypes, tooltipSupport } = serverFeatures;
      newState = {
        ...newState,
        availableChannels,
        availableConfigTypes,
        tooltipSupport,
      };
    }

    this.setState(newState);
  }

  onSelectedDataSources = (dataSources: DataSourceOption[]) => {
    const { id = "", label = "" } = dataSources[0] || {};
    if (this.state.dataSourceId !== id || this.state.dataSourceLabel !==label) {
      this.setState({
        dataSourceId: id,
        dataSourceLabel: label,
      });
    }
    if (this.state.dataSourceLoading) {
      this.setState({
        dataSourceLoading: false,
      });
    }
  };

  dataSourceFilterFn = (dataSource: SavedObject<DataSourceAttributes>) => {
    const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || "";
    const installedPlugins = dataSource?.attributes?.installedPlugins || [];
    return (
      semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions) &&
      pluginManifest.requiredOSDataSourcePlugins.every((plugin) => installedPlugins.includes(plugin))
    );
  };

  getServices(http: HttpSetup) {
    const {
      location: { pathname },
    } = this.props;
    let notificationService;
    if (this.props.multiDataSourceEnabled) {
      notificationService = new NotificationService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
    }
    else {
      notificationService = new NotificationService(http);
    }
    const services = {
      notificationService,
    };
    return services;
  }

  render() {
    const {
      location: { pathname },
    } = this.props;
    let DataSourceMenuSelectable, DataSourceMenuView;
    let activeOption: DataSourceOption[] | undefined;
    if (this.props.multiDataSourceEnabled) {
      DataSourceMenuSelectable = this.props.dataSourceManagement?.ui?.getDataSourceMenu<DataSourceSelectableConfig>();
      DataSourceMenuView = this.props.dataSourceManagement?.ui?.getDataSourceMenu<DataSourceViewConfig>();
      activeOption = this.state.dataSourceLoading
        ? undefined
        : [
          {
            label: this.state.dataSourceLabel,
            id: this.state.dataSourceId,
          },
        ];
    }
    const sideNav = [
      {
        name: Navigation.Notifications,
        id: 0,
        href: `#${Pathname.Channels}`,
        items: [
          {
            name: Navigation.Channels,
            id: 2,
            href: `#${Pathname.Channels}`,
            isSelected: pathname === Pathname.Channels,
          },
          {
            name: Navigation.EmailSenders,
            id: 3,
            href: `#${ROUTES.EMAIL_SENDERS}`,
            isSelected: pathname === ROUTES.EMAIL_SENDERS,
          },
          {
            name: Navigation.EmailGroups,
            id: 4,
            href: `#${ROUTES.EMAIL_GROUPS}`,
            isSelected: pathname === ROUTES.EMAIL_GROUPS,
          },
        ],
      },
    ];
    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <ServicesContext.Provider value={this.getServices(core.http)}>
              <ServicesConsumer>
                {(services: BrowserServices | null) =>
                  services && (
                    <MainContext.Provider value={this.state}>
                    <ModalProvider>
                      <DataSourceMenuContext.Provider
                        value={{
                          dataSourceId: this.state.dataSourceId,
                          dataSourceLabel: this.state.dataSourceLabel,
                          multiDataSourceEnabled: this.props.multiDataSourceEnabled,
                        }}
                      >
                        {this.props.multiDataSourceEnabled && DataSourceMenuView && DataSourceMenuSelectable && (
                          <Switch>
                            <Route
                              path={[
                                `${ROUTES.EDIT_CHANNEL}/:id`,
                                `${ROUTES.CHANNEL_DETAILS}/:id`,
                                `${ROUTES.EDIT_SENDER}/:id`,
                                `${ROUTES.EDIT_RECIPIENT_GROUP}/:id`,
                                `${ROUTES.EDIT_SES_SENDER}/:id`
                              ]}
                              render={() => (
                                <DataSourceMenuView
                                  setMenuMountPoint={this.props.setActionMenu}
                                  componentType={"DataSourceView"}
                                  componentConfig={{
                                    activeOption: [{ label: this.state.dataSourceLabel, id: this.state.dataSourceId }],
                                    dataSourceFilter: this.dataSourceFilterFn,
                                  }}
                                />
                              )}
                            />
                            <Route
                              path={[
                                "/",
                                ROUTES.CHANNELS,
                                ROUTES.CREATE_CHANNEL,
                                ROUTES.CREATE_SENDER,
                                ROUTES.CREATE_SES_SENDER,
                                ROUTES.CREATE_RECIPIENT_GROUP,
                                ROUTES.EMAIL_GROUPS,
                                ROUTES.EMAIL_SENDERS,
                                ROUTES.NOTIFICATIONS,
                              ]}
                              render={() => (
                                <DataSourceMenuSelectable
                                  setMenuMountPoint={this.props.setActionMenu}
                                  componentType={"DataSourceSelectable"}
                                  componentConfig={{
                                    savedObjects: core?.savedObjects.client,
                                    notifications: core?.notifications,
                                    fullWidth: false,
                                    activeOption,
                                    onSelectedDataSources: this.onSelectedDataSources,
                                    dataSourceFilter: this.dataSourceFilterFn,
                                  }}
                                />
                              )}
                            />
                            <Route
                              path={[ROUTES.CREATE_SES_SENDER, ROUTES.CREATE_CHANNEL, ROUTES.CREATE_RECIPIENT_GROUP, ROUTES.CREATE_SENDER]}
                              render={() =>
                                this.state.dataSourceReadOnly ? (
                                  <DataSourceMenuView
                                    setMenuMountPoint={this.props.setActionMenu}
                                    componentType={"DataSourceView"}
                                    componentConfig={{
                                      activeOption: [{ label: this.state.dataSourceLabel, id: this.state.dataSourceId }],
                                      fullWidth: false,
                                      dataSourceFilter: this.dataSourceFilterFn,
                                    }}
                                  />
                                ) : (
                                  <DataSourceMenuSelectable
                                    setMenuMountPoint={this.props.setActionMenu}
                                    componentType={"DataSourceSelectable"}
                                    componentConfig={{
                                      savedObjects: core?.savedObjects.client,
                                      notifications: core?.notifications,
                                      fullWidth: false,
                                      activeOption,
                                      onSelectedDataSources: this.onSelectedDataSources,
                                      dataSourceFilter: this.dataSourceFilterFn,
                                    }}
                                  />
                                )
                              }
                            />
                          </Switch>
                        )}
                      <EuiPage>
                        {!this.state.dataSourceLoading && (
                          <>
                        <ModalRoot services={services} />
                        {pathname !== ROUTES.CREATE_CHANNEL &&
                          !pathname.startsWith(ROUTES.EDIT_CHANNEL) &&
                          !pathname.startsWith(ROUTES.CHANNEL_DETAILS) &&
                          pathname !== ROUTES.CREATE_SENDER &&
                          !pathname.startsWith(ROUTES.EDIT_SENDER) &&
                          pathname !== ROUTES.CREATE_SES_SENDER &&
                          !pathname.startsWith(ROUTES.EDIT_SES_SENDER) &&
                          pathname !== ROUTES.CREATE_RECIPIENT_GROUP &&
                          !pathname.startsWith(ROUTES.EDIT_RECIPIENT_GROUP) && (
                            <EuiPageSideBar style={{ minWidth: 155 }}>
                              <EuiSideNav
                                style={{ width: 155 }}
                                items={sideNav}
                              />
                            </EuiPageSideBar>
                          )}
                        <EuiPageBody>
                          <Switch>
                            <Route
                              path={ROUTES.CREATE_CHANNEL}
                              render={(props: RouteComponentProps) => (
                                <CreateChannel {...props} />
                              )}
                            />
                            <Route
                              path={`${ROUTES.EDIT_CHANNEL}/:id`}
                              render={(
                                props: RouteComponentProps<{ id: string }>
                              ) => <CreateChannel {...props} edit={true} />}
                            />
                            <Route
                              path={`${ROUTES.CHANNEL_DETAILS}/:id`}
                              render={(
                                props: RouteComponentProps<{ id: string }>
                              ) => <ChannelDetails {...props} />}
                            />
                            <Route
                              path={ROUTES.CHANNELS}
                              render={(props: RouteComponentProps) => (
                                <Channels
                                  {...props}
                                  notificationService={
                                    services?.notificationService as NotificationService
                                  }
                                />
                              )}
                            />
                            <Route
                              path={ROUTES.EMAIL_SENDERS}
                              render={(props: RouteComponentProps) => (
                                <EmailSenders
                                  {...props}
                                  notificationService={
                                    services?.notificationService as NotificationService
                                  }
                                /> // send dataSourceId as props or externally
                              )}
                            />
                            <Route
                              path={ROUTES.EMAIL_GROUPS}
                              render={(props: RouteComponentProps) => (
                                <EmailGroups
                                  {...props}
                                  notificationService={
                                    services?.notificationService as NotificationService
                                  }
                                />
                              )}
                            />
                            <Route
                              path={ROUTES.CREATE_SENDER}
                              render={(props: RouteComponentProps) => (
                                <CreateSender
                                  {...props}
                                />
                              )}
                            />
                            <Route
                              path={`${ROUTES.EDIT_SENDER}/:id`}
                              render={(props: RouteComponentProps) => (
                                <CreateSender {...props} edit={true} />
                              )}
                            />
                            <Route
                              path={ROUTES.CREATE_SES_SENDER}
                              render={(props: RouteComponentProps) => (
                                <CreateSESSender
                                  {...props}
                                />
                              )}
                            />
                            <Route
                              path={`${ROUTES.EDIT_SES_SENDER}/:id`}
                              render={(props: RouteComponentProps) => (
                                <CreateSESSender {...props} edit={true} />
                              )}
                            />
                            <Route
                              path={ROUTES.CREATE_RECIPIENT_GROUP}
                              render={(props: RouteComponentProps) => (
                                <CreateRecipientGroup
                                  {...props}
                                />
                              )}
                            />
                            <Route
                              path={`${ROUTES.EDIT_RECIPIENT_GROUP}/:id`}
                              render={(props: RouteComponentProps) => (
                                <CreateRecipientGroup {...props} edit={true} />
                              )}
                            />
                            <Redirect from="/" to={ROUTES.CHANNELS} />
                          </Switch>
                        </EuiPageBody></>
                        )}
                      </EuiPage>
                      </DataSourceMenuContext.Provider>
                    </ModalProvider>
                    </MainContext.Provider>
                  )
                }
              </ServicesConsumer>
            </ServicesContext.Provider>
          )
        }
      </CoreServicesConsumer>
    );
  }
}
