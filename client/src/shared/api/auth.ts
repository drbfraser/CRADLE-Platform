import { EndpointEnum } from '../enums';
import { axiosFetch } from './api';
import { AuthResponse, authResponseSchema } from './validation/login';

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
