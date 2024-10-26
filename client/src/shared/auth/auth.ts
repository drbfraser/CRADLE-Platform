import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import config from './auth_config.json';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

export const signIn = async (username: string, password: string) => {
  const params: InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: config.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (!AuthenticationResult) {
      throw new Error('Authentication failed.');
    }
    sessionStorage.setItem('idToken', AuthenticationResult.IdToken || '');
    sessionStorage.setItem(
      'accessToken',
      AuthenticationResult.AccessToken || ''
    );
    sessionStorage.setItem(
      'refreshToken',
      AuthenticationResult.RefreshToken || ''
    );
    return AuthenticationResult;
  } catch (e) {
    console.error('Error signing in: ', e);
    throw e;
  }
};
