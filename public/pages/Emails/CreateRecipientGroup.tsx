/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiComboBoxOptionOption,
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
import { CreateRecipientGroupForm } from './components/forms/CreateRecipientGroupForm';
import { createRecipientGroupConfigObject } from './utils/helper';
import {
  validateRecipientGroupEmails,
  validateRecipientGroupName,
} from './utils/validationHelper';
import { getUseUpdatedUx } from '../../services/utils/constants';

interface CreateRecipientGroupProps
  extends RouteComponentProps<{ id?: string }> {
  edit?: boolean;
}

export function CreateRecipientGroup(props: CreateRecipientGroupProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmailOptions, setSelectedEmailOptions] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >([]);
  const [emailOptions, setEmailOptions] = useState([
    {
      label: 'no-reply@company.com',
    },
  ]);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string[] }>({
    name: [],
    emailOptions: [],
  });

  const isInputValid = (): boolean => {
    const errors: { [key: string]: string[] } = {
      name: validateRecipientGroupName(name),
      emailOptions: validateRecipientGroupEmails(selectedEmailOptions),
    };
    setInputErrors(errors);
    return !Object.values(errors).reduce(
      (errorFlag, error) => errorFlag || error.length > 0,
      false
    );
  };

  useEffect(() => {
    setBreadcrumbs([
      BREADCRUMBS.NOTIFICATIONS,
      BREADCRUMBS.EMAIL_GROUPS,
      props.edit
        ? BREADCRUMBS.EDIT_RECIPIENT_GROUP
        : BREADCRUMBS.CREATE_RECIPIENT_GROUP,
    ]);
    window.scrollTo(0, 0);

    if (props.edit) {
      getRecipientGroup();
    }
  }, []);

  const getRecipientGroup = async () => {
    const id = props.match.params?.id;
    if (typeof id !== 'string') return;

    try {
      const response = await servicesContext.notificationService.getRecipientGroup(
        id
      );
      setName(response.name);
      setDescription(response.description || '');
      setSelectedEmailOptions(
        response.email_group.recipient_list.map((recipient) => ({
          label: recipient.recipient,
        }))
      );
    } catch (error) {
      coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading recipient group.')
      );
    }
  };

  return (
    <>
      {!getUseUpdatedUx() && (
        <EuiText size="s">
          <h1>{`${props.edit ? 'Edit' : 'Create'} recipient group`}</h1>
        </EuiText>
      )}

      <EuiSpacer />
      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Configure recipient group"
        titleSize="s"
        panelStyles={{ maxWidth: 1000 }}
      >
        <CreateRecipientGroupForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          selectedEmailOptions={selectedEmailOptions}
          setSelectedEmailOptions={setSelectedEmailOptions}
          emailOptions={emailOptions}
          setEmailOptions={setEmailOptions}
          inputErrors={inputErrors}
          setInputErrors={setInputErrors}
        />
      </ContentPanel>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd" style={{ maxWidth: 1024 }}>
        <EuiFlexItem grow={false}>
          <EuiSmallButtonEmpty href={`#${ROUTES.EMAIL_GROUPS}`}>
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
              const config = createRecipientGroupConfigObject(
                name,
                description,
                selectedEmailOptions
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
                    `Recipient group ${name} successfully ${props.edit ? 'updated' : 'created'
                    }.`
                  );
                  setTimeout(
                    () => (location.hash = `#${ROUTES.EMAIL_GROUPS}`),
                    SERVER_DELAY
                  );
                })
                .catch((error) => {
                  setLoading(false);
                  coreContext.notifications.toasts.addError(
                    error?.body || error,
                    {
                      title: `Failed to ${props.edit ? 'update' : 'create'
                        } recipient group.`,
                    }
                  );
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
