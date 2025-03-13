import jwt from 'jsonwebtoken';

export const createFakeAccessToken = () => {
  return jwt.sign(
    { exp: Date.now() / 1000 + 3600, username: 'admin' },
    'fake-secret-key'
  );
};
