import {
  Button,
  ButtonProps,
  StyledEngineProvider,
  Theme,
  ThemeProvider,
  createTheme,
} from '@mui/material';

import { red } from '@mui/material/colors';
import { useHistory } from 'react-router-dom';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DefaultTheme extends Theme {}
}

interface RedirectButtonProps extends ButtonProps {
  url: string;
}

const redTheme = createTheme({ palette: { primary: red } });

export const CancelButton = (otherProps: ButtonProps) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={redTheme}>
      <Button size="large" {...otherProps} color="primary" variant="text" />
    </ThemeProvider>
  </StyledEngineProvider>
);

export const PrimaryButton = (props: ButtonProps) => (
  <Button size="large" {...props} color="primary" variant="contained" />
);

export const SecondaryButton = (props: ButtonProps) => (
  <Button size="large" {...props} color="primary" variant="outlined" />
);

export const RedirectButton = ({ url, ...props }: RedirectButtonProps) => {
  const history = useHistory();
  return <SecondaryButton {...props} onClick={() => history.push(url)} />;
};
