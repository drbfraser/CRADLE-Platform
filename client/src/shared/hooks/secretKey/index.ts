import { useCallback, useState } from 'react';
import { useAppDispatch } from 'src/app/context/hooks';
import { SecretKeyState, updateSecretKey } from 'src/redux/reducers/secretKey';
import { getSecretKeyAsync, updateSecretKeyAsync } from 'src/shared/api';
import { UserRoleEnum } from 'src/shared/enums';
import { IUserWithTokens, OrNull, SecretKey } from 'src/shared/types';

type UseSecretKeyReturn = {
  role?: UserRoleEnum;
  currentSecretKey: SecretKey | undefined;
  setFocusUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
  getUserSecretKeyHandler: () => Promise<void>;
  updateSecretKeyHandler: () => Promise<void>;
};

export const useSecretKey = (
  secretKey: SecretKeyState,
  userData: OrNull<Pick<IUserWithTokens, 'role' | 'userId'>>
): UseSecretKeyReturn => {
  const dispatch = useAppDispatch();
  const [focusUserId, setFocusUserId] = useState<number | undefined>(
    userData?.userId
  );
  const [currentSecretKey, setCurrentSecretKey] = useState<
    SecretKey | undefined
  >(secretKey.data);

  const getUserSecretKeyHandler = useCallback(async () => {
    if (userData?.userId === focusUserId || secretKey !== undefined) {
      setCurrentSecretKey(secretKey.data);
      return;
    }
    if (userData?.role !== UserRoleEnum.ADMIN || focusUserId === undefined) {
      return;
    }
    const response = await getSecretKeyAsync(focusUserId);
    setCurrentSecretKey(response.data);
  }, [focusUserId]);

  const updateSecretKeyHandler = useCallback(async () => {
    if (userData && userData.userId === focusUserId) {
      dispatch(updateSecretKey(userData.userId));
      return;
    }
    if (userData?.role !== UserRoleEnum.ADMIN || focusUserId === undefined) {
      return;
    }
    const response = await updateSecretKeyAsync(focusUserId);
    setCurrentSecretKey(response.data);
  }, [currentSecretKey]);

  return {
    role: userData?.role,
    currentSecretKey,
    setFocusUserId,
    getUserSecretKeyHandler,
    updateSecretKeyHandler,
  };
};
