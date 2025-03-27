export const BASE_API_URL = 'http://127.0.0.1:5000';
export const AUTH_FILE = 'test-results/.auth/user.json';

export type Credentials = {
  username: string;
  password: string;
};

export const ADMIN_CREDENTIALS: Credentials = {
  username: 'admin',
  password: 'cradle-admin',
} as const;

export type FacilityName =
  | 'H0000'
  | 'H1000'
  | 'H2000'
  | 'H3000'
  | 'H4000'
  | 'H5000';
