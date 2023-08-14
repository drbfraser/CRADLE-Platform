import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from 'src/app/context/hooks';
import { SecretKeyState, replaceSecretKey } from 'src/redux/reducers/secretKey';
import {
  getSecretKeyAsync,
  getUsersAsync,
  updateSecretKeyAsync,
} from 'src/shared/api';
import { UserRoleEnum } from 'src/shared/enums';
import {
  IUserWithIndex,
  IUserWithTokens,
  OrNull,
  SecretKey,
} from 'src/shared/types';

type UseSecretKeyReturn = {
  users: Pick<IUserWithIndex, 'email' | 'index' | 'userId'>[];
  role?: UserRoleEnum;
  currentSecretKey?: SecretKey;
  focusUserId?: number;
  setFocusUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
  updateSecretKeyHandler: () => void;
};

export const useSecretKey = (
  secretKey: SecretKeyState,
  userData: OrNull<Pick<IUserWithTokens, 'role' | 'userId'>>,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateMessage: React.Dispatch<React.SetStateAction<boolean>>
): UseSecretKeyReturn => {
  const dispatch = useAppDispatch();
  const [focusUserId, setFocusUserId] = useState<number | undefined>(
    userData?.userId
  );
  const [currentSecretKey, setCurrentSecretKey] = useState<
    SecretKey | undefined
  >(secretKey.data);
  const [users, setUsers] = useState<
    Pick<IUserWithIndex, 'email' | 'index' | 'userId'>[]
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
    const resp: IUserWithIndex[] = await getUsersAsync();
    setUsers(
      resp.map((user, index) => ({
        email: user.email,
        userId: user.userId,
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
    if (userData && userData.userId === focusUserId) {
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
