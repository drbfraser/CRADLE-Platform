import React from 'react';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
interface SecondaryRedirectButtonProps {
  redirectUrl: string;
  text: string;
}

export const SecondaryRedirectButton = ({
  redirectUrl,
  text,
}: SecondaryRedirectButtonProps) => {
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
