import React from 'react';
import { Button } from '@material-ui/core';
//import { useHistory } from 'react-router-dom';

interface CancelButtonProps {

    text: string;
    somethingToDo: string| any;
    position: string
}

export const CancelButton = ({text,somethingToDo,position}: CancelButtonProps) => {
   //const history = useHistory();
   if(position === "no right")
   {
    return (
      <Button
        color="primary"
        variant="text"
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
      variant="text"
      size = "large"
      style={{ float: 'right' }}
      onClick = {somethingToDo}>
      {text}
    </Button>
  );
}
  };
