import React from 'react';
import { Button } from '@material-ui/core';
interface CancelButtonProps {
  text: string;
  task: string | any;
  position?: string;
}

export const CancelButton = ({
  text,
  task: somethingToDo,
  position,
}: CancelButtonProps) => {
  if (position === 'right') {
    return (
      <Button
        color="primary"
        variant="text"
        size="large"
        style={{ float: 'right' }}
        onClick={somethingToDo}>
        {text}
      </Button>
    );
  } else {
    return (
      <Button
        color="primary"
        variant="text"
        size="large"
        onClick={somethingToDo}>
        {text}
      </Button>
    );
  }
};
