import React from 'react';
import { Button } from '@material-ui/core';


interface PrimaryButtonProps {

    text: string;
    task: string|any;
    position: string
}

export const PrimaryButton = ({text,task: somethingToDo,position}: PrimaryButtonProps) => {
   if(position === "no right")
   {
    return (
      <Button
        color="primary"
        variant="contained"
        size = "large"
        onClick = {somethingToDo}>
        {text}
      </Button>
    );
}
else{
  return (
    <Button
      color="primary"
      variant="contained"
      size = "large"
      style={{ float: 'right' }}
      onClick = {somethingToDo}>
      {text}
    </Button>
  );
}
  };
