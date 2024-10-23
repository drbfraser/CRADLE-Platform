import { Auth0Provider } from '@auth0/auth0-react';
import { PropsWithChildren } from 'react';
import { getAuthConfig } from './authConfig';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const authConfig = getAuthConfig();
  const providerConfig = {
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    authorizationParams: {
      redirect_uri: authConfig.callbackURL,
    },
  };

  return (
    <Auth0Provider
      {...providerConfig}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || window.location.pathname);
      }}>
      {children}
    </Auth0Provider>
  );
};
