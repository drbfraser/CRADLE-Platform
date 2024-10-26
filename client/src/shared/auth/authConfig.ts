import configJson from './auth_config.json';

export const getAuthConfig = () => {
  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    callbackURL: configJson.callbackURL,
  };
};
