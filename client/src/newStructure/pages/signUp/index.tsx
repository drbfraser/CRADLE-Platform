import {
  clearRegisterUserRequestOutcome,
  registerUser,
} from '../../redux/reducers/user/allUsers';
import { useDispatch, useSelector } from 'react-redux';

import { AutocompleteOption } from '../../shared/components/input/autocomplete/utils';
import { OrNull } from '@types';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/reducers';
import { SignUpForm } from './form';
import { Toast } from '../../shared/components/toast';

type SignUpData = {
  email: string;
  firstName: string;
  password: string;
  role: OrNull<AutocompleteOption<string, string>>;
  healthFacilityName: OrNull<AutocompleteOption<string, string>>;
};

type SelectorState = {
  error: OrNull<string>;
  success: OrNull<string>;
};

export const SignUpPage: React.FC = () => {
  const { error, success } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      error: user.allUsers.createdError,
      success: user.allUsers.created,
    })
  );

  const [data, setData] = React.useState<SignUpData>({
    email: ``,
    firstName: ``,
    password: ``,
    role: null,
    healthFacilityName: null,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.persist();

    setData(
      (currentData: SignUpData): SignUpData => ({
        ...currentData,
        [event.target.name]: event.target.value,
      })
    );
  };

  const handleSelectChange = (
    name: `role` | `healthFacilityName`
  ): ((
    event: React.ChangeEvent<Record<string, unknown>>,
    value: AutocompleteOption<string, string>
  ) => void) => {
    return (
      _: React.ChangeEvent<Record<string, unknown>>,
      value: AutocompleteOption<string, string>
    ): void => {
      setData(
        (currentData: SignUpData): SignUpData => ({
          ...currentData,
          [name]: value,
        })
      );
    };
  };

  const dispatch = useDispatch();

  const handleCreate = (): void => {
    const { role, healthFacilityName, ...otherData } = data;
    if (role && healthFacilityName) {
      dispatch(
        registerUser({
          ...otherData,
          role: role.value,
          healthFacilityName: healthFacilityName.value,
        })
      );
    }
  };

  const clearMessage = (): void => {
    dispatch(clearRegisterUserRequestOutcome());
  };

  return (
    <>
      <Toast
        message={error ?? success}
        clearMessage={clearMessage}
        status={error ? `error` : `success`}
      />
      <SignUpForm
        {...data}
        handleCreate={handleCreate}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
    </>
  );
};
