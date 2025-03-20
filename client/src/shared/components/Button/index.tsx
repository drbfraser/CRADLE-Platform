import {
  Button as MuiButton,
  ButtonProps,
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from '@mui/material';

import { red } from '@mui/material/colors';
import { useNavigate, LinkProps } from 'react-router-dom';
import useIsMounted from 'src/shared/hooks/misc/useIsMounted';

interface RedirectButtonProps extends ButtonProps {
  url: string;
}

type LinkButtonProps = ButtonProps & LinkProps;

const redTheme = createTheme({ palette: { primary: red } });

/** Button is disabled until hydration. */
const Button = ({ disabled, ...props }: ButtonProps) => {
  const isMounted = useIsMounted();
  return <MuiButton {...props} disabled={!isMounted || disabled} />;
};

export const CancelButton = (otherProps: ButtonProps) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={redTheme}>
      <Button size="large" {...otherProps} color="primary" variant="text" />
    </ThemeProvider>
  </StyledEngineProvider>
);

export const PrimaryButton = (props: ButtonProps | LinkButtonProps) => (
  <Button size="large" {...props} color="primary" variant="contained" />
);

export const SecondaryButton = (props: ButtonProps | LinkButtonProps) => (
  <Button size="large" {...props} color="primary" variant="outlined" />
);

export const RedirectButton = ({ url, ...props }: RedirectButtonProps) => {
  const navigate = useNavigate();
  return <SecondaryButton {...props} onClick={() => navigate(url)} />;
};
