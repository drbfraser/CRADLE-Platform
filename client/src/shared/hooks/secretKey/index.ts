import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from 'src/shared/hooks';
import { SecretKeyState, replaceSecretKey } from 'src/redux/reducers/secretKey';
import {
  getSecretKeyAsync,
  getUsersAsync,
  updateSecretKeyAsync,
} from 'src/shared/api/api';
import { UserRoleEnum } from 'src/shared/enums';
import {
  UserWithIndex,
  UserWithToken,
  OrNull,
  SecretKey,
} from 'src/shared/types';
import { User } from 'src/shared/api/validation/user';

type UseSecretKeyReturn = {
  users: Pick<UserWithIndex, 'email' | 'index' | 'id'>[];
  role?: UserRoleEnum;
  currentSecretKey?: SecretKey;
  focusUserId?: number;
  setFocusUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
  updateSecretKeyHandler: () => void;
};

export const useSecretKey = (
  secretKey: SecretKeyState,
  userData: OrNull<Pick<UserWithToken, 'role' | 'id'>>,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateMessage: React.Dispatch<React.SetStateAction<boolean>>
): UseSecretKeyReturn => {
  const dispatch = useAppDispatch();
  const [focusUserId, setFocusUserId] = useState<number | undefined>(
    userData?.id
  );
  const [currentSecretKey, setCurrentSecretKey] = useState<
    SecretKey | undefined
  >(secretKey.data);
  const [users, setUsers] = useState<
    Pick<UserWithIndex, 'email' | 'index' | 'id'>[]
  >([]);

  useEffect(() => {
    if (userData?.role === UserRoleEnum.ADMIN) {
      getUsers();
    }
    getUserSecretKey();
  }, [focusUserId]);

  const getUsers = useCallback(async () => {
    if (users.length > 0) {
      return;
    }
    const resp: User[] = await getUsersAsync();
    setUsers(
      resp.map((user, index) => ({
        email: user.email,
        id: user.id,
        index,
      }))
    );
  }, []);

  const getUserSecretKey = useCallback(async () => {
    if (focusUserId === undefined) {
      return;
    }
    if (currentSecretKey === undefined) {
      const response = await getSecretKeyAsync(focusUserId);
      setCurrentSecretKey({ ...response });
      return;
    }
    if (userData?.role !== UserRoleEnum.ADMIN) {
      return;
    }
    const response = await getSecretKeyAsync(focusUserId);
    setCurrentSecretKey({ ...response });
  }, [focusUserId]);

  const updateSecretKeyHandler = () => {
    updateSecretKey();
    setShowModal(false);
    setUpdateMessage(true);
  };

  const updateSecretKey = useCallback(async () => {
    if (userData && userData.id === focusUserId) {
      const response = await updateSecretKeyAsync(focusUserId);
      setCurrentSecretKey({ ...response });
      return;
    }
    if (userData?.role !== UserRoleEnum.ADMIN || focusUserId === undefined) {
      return;
    }
    const response = await updateSecretKeyAsync(focusUserId);
    setCurrentSecretKey({ ...response });
    dispatch(replaceSecretKey(response));
  }, [currentSecretKey]);

  return {
    users,
    role: userData?.role,
    currentSecretKey,
    focusUserId,
    setFocusUserId,
    updateSecretKeyHandler,
  };
};
