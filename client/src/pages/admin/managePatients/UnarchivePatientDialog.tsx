import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Patient } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { unarchivePatientAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

const UnarchivePatientDialog = ({ open, onClose, patient }: IProps) => {
  const unarchivePatient = useMutation({
    mutationFn: unarchivePatientAsync,
  });

  const handleUnarchive = () => {
    unarchivePatient.mutate(patient.id, {
      onSuccess: () => onClose(),
    });
  };

  const name = patient.name;
  return (
    <>
      <Toast
        severity="success"
        message="Patient successfully unarchived!"
        open={unarchivePatient.isSuccess}
      />
      {unarchivePatient.isError && (
        <APIErrorToast onClose={() => unarchivePatient.reset()} />
      )}

      <ConfirmDialog
        title={`Unarchive Patient: ${name}`}
        content={`Are you sure you want to unarchive ${name}'s account? `}
        open={open}
        onClose={onClose}
        onConfirm={handleUnarchive}
      />
    </>
  );
};

export default UnarchivePatientDialog;
