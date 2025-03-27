import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Patient } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { archivePatientAsync } from 'src/shared/api/api';

interface IProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

const ArchivePatientDialog = ({ open, onClose, patient }: IProps) => {
  const archivePatient = useMutation({
    mutationFn: archivePatientAsync,
  });

  const handleArchive = () => {
    archivePatient.mutate(patient.id, {
      onSuccess: () => onClose(),
    });
  };

  const name = patient.name;
  return (
    <>
      <Toast
        severity="success"
        message="Patient successfully archived!"
        open={archivePatient.isSuccess}
      />
      {archivePatient.isError && (
        <APIErrorToast onClose={() => archivePatient.reset()} />
      )}

      <ConfirmDialog
        title={`Archive Patient: ${name}`}
        content={`Are you sure you want to archive ${name}'s account? `}
        open={open}
        onClose={onClose}
        onConfirm={handleArchive}
      />
    </>
  );
};

export default ArchivePatientDialog;
