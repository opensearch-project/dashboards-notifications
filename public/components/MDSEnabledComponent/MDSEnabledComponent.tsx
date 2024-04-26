import React, { useContext, useEffect } from "react";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../services/DataSourceMenuContext";
import { useHistory } from "react-router";
import queryString from "query-string";
import { MainContext } from '../../pages/Main/Main';

export default class MDSEnabledComponent<
  Props extends DataSourceMenuProperties,
  State extends DataSourceMenuProperties
> extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dataSourceId: props.dataSourceId,
      multiDataSourceEnabled: props.multiDataSourceEnabled,
    } as State;
  }
}

export function isDataSourceChanged(prevProps, currentProps) {
  if (
    prevProps.notificationService?.multiDataSourceEnabled &&
    currentProps.notificationService?.multiDataSourceEnabled
  ) {
    const prevDataSourceId = prevProps.notificationService.dataSourceId;
    const currDataSourceId = currentProps.notificationService.dataSourceId;
    if (!_.isEqual(prevDataSourceId, currDataSourceId)) {
      return true;
    }
  }
  return false;
}

export function isDataSourceError(error) {
  return (error.body && error.body.message && error.body.message.includes("Data Source Error"));
}


