import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Toast } from 'src/shared/components/toast';
import { deleteUserAsync } from 'src/shared/api/api';
import { User } from 'src/shared/api/validation/user';

interface IProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

const DeleteUserDialog = ({ open, onClose, user }: IProps) => {
  const deleteUser = useMutation({
    mutationFn: deleteUserAsync,
  });

  const handleDelete = () => {
    deleteUser.mutate(user, {
      onSuccess: () => onClose(),
    });
  };

  const name = user.name;
  return (
    <>
      <Toast
        severity="success"
        message="User successfully deleted!"
        open={deleteUser.isSuccess}
      />
      {deleteUser.isError && (
        <APIErrorToast onClose={() => deleteUser.reset()} />
      )}

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

export default DeleteUserDialog;
