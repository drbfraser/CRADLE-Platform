//move user apis to here
import { axiosFetch } from '../core/http';
import { EndpointEnum, UserRoleEnum } from 'src/shared/enums';
import { EditUser, NewUser, User, userListSchema } from '../validation/user';
//curd
export const deleteUserAsync = async (user: User) => {
  const response = await axiosFetch({
    url: EndpointEnum.USER + String(user.id),
    method: 'DELETE',
  });
  return response.data;
};

export const createUserAsync = async (newUser: NewUser) => {
  const response = await axiosFetch({
    method: 'POST',
    url: EndpointEnum.USER_REGISTER,
    data: {
      ...newUser,
      supervises: newUser.role === UserRoleEnum.CHO ? newUser.supervises : [],
    },
  });
  return response.data;
};

export const editUserAsync = async (editUser: EditUser, userId: number) => {
  const response = await axiosFetch({
    method: 'PUT',
    url: EndpointEnum.USER + userId,
    data: {
      ...editUser,
      supervises: editUser.role === UserRoleEnum.CHO ? editUser.supervises : [],
    },
  });
  return response;
};

export const getUsersAsync = async (): Promise<User[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.USER_ALL,
  });
  const data = await response.data;

  return new Promise((resolve, reject) => {
    const result = userListSchema.safeParse(data);
    if (result.success) {
      return resolve(result.data);
    } else {
      console.error(result.error);
      return reject(result.error);
    }
  });
};

export const getUserAsync = async (userId: string): Promise<User> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.USER + userId,
  });
  return response.data;
};

//password
export const resetUserPasswordAsync = async (user: User, password: string) => {
  return axiosFetch({
    method: 'POST',
    url: EndpointEnum.USER + String(user.id) + EndpointEnum.RESET_PASS,
    data: { password: password },
  });
};

//SECRETKEY
export const getSecretKeyAsync = async (userId: number) => {
  const response = await axiosFetch({
    method: 'GET',
    url: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};

export const updateSecretKeyAsync = async (userId: number) => {
  const response = await axiosFetch({
    method: 'PUT',
    url: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};
