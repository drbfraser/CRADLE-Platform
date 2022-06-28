import React from 'react';
import { Button } from '@material-ui/core';

interface SecondaryButtonProps {
  text: string;
  task: string | any;
  position: string;
}

export const SecondaryButton = ({
  text,
  task: somethingToDo,
  position,
}: SecondaryButtonProps) => {
  if (position === 'no right') {
    return (
      <Button
        color="primary"
        variant="outlined"
        size="large"
        onClick={somethingToDo}>
        {text}
      </Button>
    );
  } else {
    return (
      <Button
        color="primary"
        variant="outlined"
        size="large"
        style={{ float: 'right' }}
        onClick={somethingToDo}>
        {text}
      </Button>
    );
  }
};
