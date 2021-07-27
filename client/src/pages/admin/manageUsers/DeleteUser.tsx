import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { IUser } from 'src/shared/types';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';

interface IProps {
  open: boolean;
  onClose: () => void;
  deleteUser: IUser | undefined;
}

const DeleteUser = ({ open, onClose, deleteUser }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const name = deleteUser?.firstName ?? '';

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    try {
      const url = API_URL + EndpointEnum.USER + String(deleteUser.userId);
      await apiFetch(url, {
        method: 'DELETE',
      });

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
