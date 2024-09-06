/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SERVER_DELAY } from '../../../common';
import { ContentPanel } from '../../components/ContentPanel';
import { CoreServicesContext } from '../../components/coreServices';
import { ServicesContext } from '../../services';
import { BREADCRUMBS, ROUTES, setBreadcrumbs } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';
import { MainContext } from '../Main/Main';
import { CreateSESSenderForm } from './components/forms/CreateSESSenderForm';
import { createSesSenderConfigObject } from './utils/helper';
import {
  validateAwsRegion,
  validateEmail,
  validateRoleArn,
  validateSenderName,
} from './utils/validationHelper';
import { getUseUpdatedUx } from '../../services/utils/constants';
interface CreateSESSenderProps extends RouteComponentProps<{ id?: string }> {
  edit?: boolean;
}

export function CreateSESSender(props: CreateSESSenderProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const mainStateContext = useContext(MainContext)!;

  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [email, setEmail] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [awsRegion, setAwsRegion] = useState('');
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string[] }>({
    senderName: [],
    email: [],
    roleArn: [],
    awsRegion: [],
  });

  useEffect(() => {
    setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.EMAIL_SENDERS,
      props.edit ? BREADCRUMBS.EDIT_SES_SENDER : BREADCRUMBS.CREATE_SES_SENDER,
    ]);
    window.scrollTo(0, 0);

    if (props.edit) {
      getSESSender();
    }
  }, []);

  const getSESSender = async () => {
    const id = props.match.params?.id;
    if (typeof id !== 'string') return;

    try {
      const response = await servicesContext.notificationService.getSESSender(
        id
      );
      setSenderName(response.name);
      setEmail(response.ses_account.from_address);
      setRoleArn(response.ses_account.role_arn || '');
      setAwsRegion(response.ses_account.region);
    } catch (error) {
      coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading sender.')
      );
    }
  };

  const isInputValid = (): boolean => {
    const errors: { [key: string]: string[] } = {
      senderName: validateSenderName(senderName),
      email: validateEmail(email),
      awsRegion: validateAwsRegion(awsRegion),
      roleArn: [],
    };
    if (!mainStateContext.tooltipSupport) {
      errors.roleArn = validateRoleArn(roleArn);
    }
    setInputErrors(errors);
    return !Object.values(errors).reduce(
      (errorFlag, error) => errorFlag || error.length > 0,
      false
    );
  };

  return (
    <>
      {!getUseUpdatedUx() && (
        <EuiText size="s">
          <h1>{`${props.edit ? 'Edit' : 'Create'} SES sender`}</h1>
        </EuiText>
      )}

      <EuiSpacer />
      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Configure sender"
        titleSize="s"
        panelStyles={{ maxWidth: 1000 }}
      >
        <CreateSESSenderForm
          senderName={senderName}
          setSenderName={setSenderName}
          email={email}
          setEmail={setEmail}
          roleArn={roleArn}
          setRoleArn={setRoleArn}
          awsRegion={awsRegion}
          setAwsRegion={setAwsRegion}
          inputErrors={inputErrors}
          setInputErrors={setInputErrors}
        />
      </ContentPanel>

      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd" style={{ maxWidth: 1024 }}>
        <EuiFlexItem grow={false}>
          <EuiSmallButtonEmpty href={`#${ROUTES.EMAIL_SENDERS}`}>
            Cancel
          </EuiSmallButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            fill
            isLoading={loading}
            onClick={async () => {
              if (!isInputValid()) {
                coreContext.notifications.toasts.addDanger(
                  'Some fields are invalid. Fix all highlighted error(s) before continuing.'
                );
                return;
              }
              setLoading(true);
              const config = createSesSenderConfigObject(
                senderName,
                email,
                awsRegion,
                roleArn
              );
              const request = props.edit
                ? servicesContext.notificationService.updateConfig(
                  props.match.params.id!,
                  config
                )
                : servicesContext.notificationService.createConfig(config);
              await request
                .then((response) => {
                  coreContext.notifications.toasts.addSuccess(
                    `Sender ${senderName} successfully ${props.edit ? 'updated' : 'created'
                    }.`
                  );
                  setTimeout(
                    () => (location.hash = `#${ROUTES.EMAIL_SENDERS}`),
                    SERVER_DELAY
                  );
                })
                .catch((error) => {
                  setLoading(false);
                  coreContext.notifications.toasts.addError(error?.body || error, {
                    title: `Failed to ${props.edit ? 'update' : 'create'
                      } sender.`,
                  });
                });
            }}
          >
            {props.edit ? 'Save' : 'Create'}
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
