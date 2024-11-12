import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Patient } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { unarchivePatientAsync } from 'src/shared/api/api';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | undefined;
}

const UnarchivePatient = ({ open, onClose, patient }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const name = patient?.name;

  const handleDelete = async () => {
    if (!patient) {
      return;
    }

    try {
      await unarchivePatientAsync(patient.id);

      setSubmitError(false);
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      <Toast
        severity="success"
        message="Patient successfully unarchived!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <ConfirmDialog
        title={`Unarchive Patient: ${name}`}
        content={`Are you sure you want to unarchive ${name}'s account? `}
        open={open}
        onClose={onClose}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default UnarchivePatient;
