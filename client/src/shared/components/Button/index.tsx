import {
  Button,
  ButtonBaseProps,
  ThemeProvider,
  createTheme,
} from '@material-ui/core';

import React from 'react';
import { red } from '@material-ui/core/colors';
import { useHistory } from 'react-router-dom';

interface ButtonProps extends ButtonBaseProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

interface RedirectButtonProps extends ButtonBaseProps {
  url: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const redTheme = createTheme({ palette: { primary: red } });

export const CancelButton = ({
  children,
  onClick,
  style,
  ...otherProps
}: ButtonProps) => (
  <ThemeProvider theme={redTheme}>
    <Button
      {...otherProps}
      color="primary"
      variant="text"
      size="large"
      onClick={onClick}>
      {children}
    </Button>
  </ThemeProvider>
);

export const PrimaryButton = ({
  children,
  onClick,
  style,
  ...otherProps
}: ButtonProps) => (
  <Button
    {...otherProps}
    color="primary"
    variant="contained"
    size="large"
    onClick={onClick}>
    {children}
  </Button>
);

export const SecondaryButton = ({
  children,
  onClick,
  style,
  ...otherProps
}: ButtonProps) => (
  <Button
    {...otherProps}
    color="primary"
    variant="outlined"
    size="large"
    onClick={onClick}>
    {children}
  </Button>
);

export const RedirectButton = ({
  url,
  children,
  ...otherProps
}: RedirectButtonProps) => {
  const history = useHistory();
  return (
    <Button
      {...otherProps}
      color="primary"
      variant="outlined"
      onClick={() => history.push(url)}>
      {children}
    </Button>
  );
};
