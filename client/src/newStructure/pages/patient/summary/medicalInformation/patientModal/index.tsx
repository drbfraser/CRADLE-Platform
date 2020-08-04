import { Action, EditPatientKey, actionCreators } from '../../reducers';
import { EditedPatient, OrNull } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { DialogPopup } from '../../../../../shared/components/dialogPopup';
import { PatientInfoForm } from './form';
import React from 'react';
import { ReduxState } from '../../../../../redux/reducers';
import { Toast } from '../../../../../shared/components/toast';
import { clearUpdatePatientOutcome } from '../../../../../redux/reducers/patients';
import { useDisableSubmit } from './hooks/disableSubmit';
import { useSubmit } from './hooks/submit';

interface IProps {
  displayPatientModal: boolean;
  patient: EditedPatient;
  updateState: React.Dispatch<Action>;
}

type SelectorState = {
  error: OrNull<string>;
  loading: boolean;
  success: OrNull<string>;
};

export const PatientModal: React.FC<IProps> = ({
  displayPatientModal,
  patient,
  updateState,
}) => {
  const { loading, error, success } = useSelector(
    ({ patients }: ReduxState): SelectorState => ({
      error: patients.error,
      loading: patients.isLoading,
      success: patients.success,
    })
  );

  const dispatch = useDispatch();

  const closePatientModal = (): void => {
    updateState(actionCreators.closePatientModal());
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateState(
      actionCreators.editPatient({
        name: event.target.name as EditPatientKey,
        value: event.target.value,
      })
    );
  };

  const disabled = useDisableSubmit({ loading, editedPatient: patient });

  const handleEditedPatientSubmit = useSubmit({
    displayPatientModal,
    editedPatient: patient,
  });

  const clearMessage = (): void => {
    dispatch(clearUpdatePatientOutcome());
  };

  return (
    <>
      <Toast
        clickaway={!error}
        message={success || error}
        status={error ? `error` : `success`}
        clearMessage={clearMessage}
      />
      <DialogPopup
        open={displayPatientModal}
        onClose={closePatientModal}
        aria-labelledby="edit-patient-dialog-title"
        content={
          <form onSubmit={handleEditedPatientSubmit}>
            <PatientInfoForm patient={patient} onChange={handleChange} />
          </form>
        }
        title={`Patient Information for ID #${patient.patientId}`}
        subtitle="Fields marked with * are required"
        primaryAction={{
          children: `Submit`,
          disabled,
          type: `submit`,
          onClick: closePatientModal,
        }}
        secondaryAction={{
          children: `Cancel`,
          onClick: closePatientModal,
        }}
      />
    </>
  );
};
