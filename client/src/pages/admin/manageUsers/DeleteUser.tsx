import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { Toast } from 'src/shared/components/toast';
import { deleteUserAsync } from 'src/shared/api/api';
import { User } from 'src/shared/api/validation/user';

interface IProps {
  open: boolean;
  onClose: () => void;
  user?: User;
}

const DeleteUser = ({ open, onClose, user }: IProps) => {
  const mutation = useMutation({
    mutationFn: (user: User) => deleteUserAsync(user),
  });

  const handleDelete = () => {
    if (user) {
      mutation.mutate(user, { onSuccess: () => onClose() });
    }
  };

  const name = user?.name ?? '';
  return (
    <>
      <Toast
        severity="success"
        message="User successfully deleted!"
        open={mutation.isSuccess}
      />
      {mutation.isError && <APIErrorToast />}

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
