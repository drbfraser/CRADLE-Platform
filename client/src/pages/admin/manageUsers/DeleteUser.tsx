import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { User } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { deleteUserAsync } from 'src/shared/api/api';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  user: User | undefined;
}

const DeleteUser = ({ open, onClose, user }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const name = user?.name ?? '';

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    try {
      await deleteUserAsync(user);

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
        message="User successfully deleted!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <ConfirmDialog
        title={`Delete User: ${name}`}
        content={`Are you sure you want to delete ${name}'s account? This action
                  is permanent and cannot be undone.`}
        open={open}
        onClose={onClose}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteUser;
