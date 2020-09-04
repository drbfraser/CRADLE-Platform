import * as Yup from 'yup';

import { FormikHelpers, useFormik } from 'formik';
import {
  clearRegisterUserRequestOutcome,
  registerUser,
} from '../../../../../redux/reducers/user/allUsers';
import { useDispatch, useSelector } from 'react-redux';

import { AutocompleteOption } from '../../../../../shared/components/input/autocomplete/utils';
import Button from '@material-ui/core/Button';
import { CreateUserModal } from './modal';
import { OrNull } from '@types';
import React from 'react';
import { ReduxState } from '../../../../../redux/reducers';
import { Toast } from '../../../../../shared/components/toast';

export type CreateUserData = {
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

export const CreateUser: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = React.useCallback((): void => {
    setOpen(false);
  }, []);

  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const {
    errors,
    touched,
    values,
    setFieldValue,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: {
      email: ``,
      firstName: ``,
      password: ``,
      role: null,
      healthFacilityName: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(`Invalid email address`)
        .max(50, `Must be 50 characters or less`)
        .required(`Required`),
      firstName: Yup.string().required(`Required`),
      password: Yup.string()
        .max(20, `Must be 20 characters or less`)
        .min(6, `Must be at least 6 characters`)
        .required(`Required`),
    }),
    onSubmit: (
      values: CreateUserData,
      { resetForm }: FormikHelpers<CreateUserData>
    ) => {
      setSubmitting(true);
      const { role, healthFacilityName, ...otherData } = values;
      if (role && healthFacilityName) {
        dispatch(
          registerUser({
            ...otherData,
            role: role.value,
            healthFacilityName: healthFacilityName.value,
          })
        );
        resetForm();
      }
    },
  });

  const { error, success } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      error: user.allUsers.createdError,
      success: user.allUsers.created,
    })
  );

  React.useEffect((): void => {
    if (error || success) {
      handleClose();
      setSubmitting(false);
    }
  }, [error, success, handleClose]);

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
      setFieldValue(name, value);
    };
  };

  const dispatch = useDispatch();

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
      <Button color="primary" variant="contained" onClick={handleOpen}>
        Create User
      </Button>
      <CreateUserModal
        errors={errors}
        open={open}
        submitting={submitting}
        touched={touched}
        values={values}
        handleBlur={handleBlur}
        handleClose={handleClose}
        handleCreate={handleSubmit}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
    </>
  );
};
