import React from 'react';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
interface RedirectButtonProps {
  redirectUrl: string;
  text: string;
}

export const RedirectButton = ({ redirectUrl, text }: RedirectButtonProps) => {
  const history = useHistory();
  return (
    <Button
      color="primary"
      variant="outlined"
      style={{ float: 'right' }}
      onClick={() => history.push(redirectUrl)}>
      {text}
    </Button>
  );
};
