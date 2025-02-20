import { useMutation } from '@tanstack/react-query';
import { updateSecretKeyAsync } from 'src/shared/api/api';
import { UserRoleEnum } from 'src/shared/enums';
import { useSecretKeyQuery } from 'src/shared/queries';
import { UserWithToken, OrNull, SecretKey } from 'src/shared/types';

type UseSecretKeyReturn = {
  currentSecretKey?: SecretKey;
  updateSecretKey: () => void;
  updateSecretKeySuccess: boolean;
  resetSecretKeyMutation: () => void;
};

export const useSecretKey = (
  loggedInUser: OrNull<Pick<UserWithToken, 'role' | 'id'>>,
  selectedUserId: number | undefined
): UseSecretKeyReturn => {
  const secretKeyQuery = useSecretKeyQuery(selectedUserId);

  const updateSecretKeyMutation = useMutation({
    mutationFn: updateSecretKeyAsync,
  });

  const updateSecretKey = async () => {
    // allow the current user to only modify their own secret key
    if (loggedInUser && loggedInUser.id === selectedUserId) {
      updateSecretKeyMutation.mutate(selectedUserId);
      secretKeyQuery.refetch();
      return;
    }

    // allow the admin to change any secret key
    if (loggedInUser?.role === UserRoleEnum.ADMIN && selectedUserId) {
      updateSecretKeyMutation.mutate(selectedUserId);
      secretKeyQuery.refetch();
    }
  };

  return {
    currentSecretKey: secretKeyQuery.data,
    updateSecretKey,
    updateSecretKeySuccess: updateSecretKeyMutation.isSuccess,
    resetSecretKeyMutation: updateSecretKeyMutation.reset,
  };
};
