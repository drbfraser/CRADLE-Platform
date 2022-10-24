import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Patient } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { archivePatientAsync } from 'src/shared/api';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | undefined;
}

const ArchivePatient = ({ open, onClose, patient }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const name = patient?.patientName;


  const handleDelete = async () => {
    if (!patient) {
      return;
    }

    try {
      await archivePatientAsync(patient.patientId);

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
        message="Patient successfully archived!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <ConfirmDialog
        title={`Archive Patient: ${name}`}
        content={`Are you sure you want to archive ${name}'s account? `}
        open={open}
        onClose={onClose}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ArchivePatient;
