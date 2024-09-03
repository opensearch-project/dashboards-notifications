import React, { useContext, useEffect } from "react";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../services/DataSourceMenuContext";
import _ from 'lodash'
import { useHistory } from "react-router-dom";
import queryString from "query-string";

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

export function isDataSourceError(error: { body: { message: string | string[]; }; }) {
  return (error.body && error.body.message && error.body.message.includes("Data Source Error"));
}

export function useUpdateUrlWithDataSourceProperties() {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId, multiDataSourceEnabled } = dataSourceMenuProps;
  const history = useHistory();
  const currentSearch = history?.location?.search;
  const currentQuery = queryString.parse(currentSearch);
  useEffect(() => {
    if (multiDataSourceEnabled) {
      history.replace({
        search: queryString.stringify({
          ...currentQuery,
          dataSourceId,
        }),
      });
    }
  }, [dataSourceId, multiDataSourceEnabled]);
}

