import { Auth0Provider } from '@auth0/auth0-react';
import { PropsWithChildren } from 'react';
import { getAuthConfig } from './authConfig';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const authConfig = getAuthConfig();
  const providerConfig = {
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(authConfig.audience ? { audience: authConfig.audience } : null),
    },
  };

  return <Auth0Provider {...providerConfig}>{children}</Auth0Provider>;
};
