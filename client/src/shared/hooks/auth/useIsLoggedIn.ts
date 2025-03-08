/** The user data from the redux store may be null even if the user is
 * still logged in, so we need to check whether the user is logged in
 * based on the access token being present in local storage. */
export function useIsLoggedIn() {
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = accessToken !== null;
  return isLoggedIn;
}
