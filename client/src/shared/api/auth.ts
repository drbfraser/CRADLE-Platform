import { EndpointEnum } from '../enums';
import { axiosFetch } from './api';
import { AuthResponse, authResponseSchema } from './validation/login';
import { reduxStore } from 'src/redux/store';
import { User, userSchema } from './validation/user';
import { setCurrentUser } from 'src/redux/user-state';

export type Credentials = {
  username: string;
  password: string;
};

export const authenticate = async (
  credentials: Credentials
): Promise<AuthResponse> => {
  const response = await axiosFetch.post(EndpointEnum.AUTH, credentials);
  const authResponse: AuthResponse = await authResponseSchema.parseAsync(
    response.data
  );
  return authResponse;
};

export const getCurrentUser = async () => {
  const response = await axiosFetch.get(EndpointEnum.USER_CURRENT);
  const user: User = await userSchema.parseAsync(response.data);
  reduxStore.dispatch(setCurrentUser(user));
  return user;
};
