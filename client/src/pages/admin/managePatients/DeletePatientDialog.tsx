import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Patient } from 'src/shared/types/patientTypes';
import { Toast } from 'src/shared/components/toast';
import { deletePatientAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

const DeletePatientDialog = ({ open, onClose, patient }: IProps) => {
  const deletePatient = useMutation({
    mutationFn: deletePatientAsync,
  });

  const handleDelete = () => {
    deletePatient.mutate(patient.id, {
      onSuccess: () => onClose(),
    });
  };

  const name = patient.name;
  return (
    <>
      <Toast
        severity="success"
        message="Patient successfully deleted!"
        open={deletePatient.isSuccess}
      />
      {deletePatient.isError && (
        <APIErrorToast onClose={() => deletePatient.reset()} />
      )}

      <ConfirmDialog
        title={`Delete Patient: ${name}`}
        content={`Are you sure you want to permanently delete ${name} (ID: ${patient.id})? This deletes all of their readings, referrals, assessments, pregnancies, medical records and forms. This cannot be undone. To hide the patient instead, use Archive.`}
        open={open}
        onClose={onClose}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeletePatientDialog;
