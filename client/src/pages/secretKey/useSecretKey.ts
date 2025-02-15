import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppDispatch } from 'src/shared/hooks';
import { SecretKeyState, replaceSecretKey } from 'src/redux/reducers/secretKey';
import { getSecretKeyAsync, updateSecretKeyAsync } from 'src/shared/api/api';
import { UserRoleEnum } from 'src/shared/enums';
import { UserWithToken, OrNull, SecretKey } from 'src/shared/types';

type UseSecretKeyReturn = {
  currentSecretKey?: SecretKey;
  updateSecretKey: () => void;
  updateSecretKeySuccess: boolean;
  resetSecretKeyMutation: () => void;
};

export const useSecretKey = (
  secretKey: SecretKeyState,
  loggedInUser: OrNull<Pick<UserWithToken, 'role' | 'id'>>,
  selectedUserId: number | undefined
): UseSecretKeyReturn => {
  const dispatch = useAppDispatch();

  const secretKeyQuery = useQuery<SecretKey>({
    queryKey: ['secretKey', selectedUserId!],
    queryFn: () => getSecretKeyAsync(selectedUserId!),
    initialData: secretKey.data,
    enabled: selectedUserId !== undefined,
  });

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
      const response = await updateSecretKeyMutation.mutateAsync(
        selectedUserId
      );
      secretKeyQuery.refetch();
      dispatch(replaceSecretKey(response));
    }
  };

  return {
    currentSecretKey: secretKeyQuery.data,
    updateSecretKey,
    updateSecretKeySuccess: updateSecretKeyMutation.isSuccess,
    resetSecretKeyMutation: updateSecretKeyMutation.reset,
  };
};
