import {
  Button,
  ButtonProps,
  ThemeProvider,
  createTheme,
} from '@material-ui/core';

import React from 'react';
import { red } from '@material-ui/core/colors';
import { useHistory } from 'react-router-dom';

interface RedirectButtonProps extends ButtonProps {
  url: string;
}

const redTheme = createTheme({ palette: { primary: red } });

export const CancelButton = (otherProps: ButtonProps) => (
  <ThemeProvider theme={redTheme}>
    <Button size="large" {...otherProps} color="primary" variant="text" />
  </ThemeProvider>
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
