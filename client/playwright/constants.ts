export const BASE_URL = 'http://127.0.0.1:3000/';
export const BASE_API_URL = 'http://127.0.0.1:5000/api';
export const AUTH_FILE = 'test-results/.auth/user.json';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'cradle-admin',
} as const;

export const TEST_PATIENTS = {
  AA: {
    name: 'AA',
    id: '49300028162',
  },
  AB: {
    name: 'AB',
    id: '49300028163',
  },
  BB: {
    name: 'BB',
    id: '49300028161',
  },
} as const;
