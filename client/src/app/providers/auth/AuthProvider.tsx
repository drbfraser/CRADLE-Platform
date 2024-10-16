import { Auth0Provider } from '@auth0/auth0-react';
import { PropsWithChildren } from 'react';
import { getAuthConfig } from './authConfig';
import { useHistory } from 'react-router-dom';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const history = useHistory();
  const authConfig = getAuthConfig();
  const providerConfig = {
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    authorizationParams: {
      redirect_uri: authConfig.callbackURL,
      ...(authConfig.audience ? { audience: authConfig.audience } : null),
    },
  };

  return (
    <Auth0Provider
      {...providerConfig}
      onRedirectCallback={(appState) => {
        history.push(appState?.returnTo || window.location.pathname);
      }}>
      {children}
    </Auth0Provider>
  );
};
