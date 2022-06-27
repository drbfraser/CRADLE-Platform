import React from 'react';
import { Button } from '@material-ui/core';
//import { useHistory } from 'react-router-dom';

interface PrimaryButtonProps {

    text: string;
    somethingToDo: string| any;
    position: string
}

export const PrimaryButton = ({text,somethingToDo,position}: PrimaryButtonProps) => {
   //const history = useHistory();
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
