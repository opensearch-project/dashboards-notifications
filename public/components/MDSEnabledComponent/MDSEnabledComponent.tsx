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

