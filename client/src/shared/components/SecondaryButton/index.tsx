import React from 'react';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

interface SecondaryButtonProps {

    text: string;
    somethingToDo: string;
    position: string
}

export const SecondaryButton = ({text,somethingToDo,position}: SecondaryButtonProps) => {
    const history = useHistory();
   if(position === "no right")
   {
    return (
      <Button
        color="primary"
        variant="outlined"
        size = "large"
        onClick = {() => history.push(somethingToDo)}>
        {text}
      </Button>
    );
}
else{
  return (
    <Button
      color="primary"
      variant="outlined"
      size = "large"
      style={{ float: 'right' }}
      onClick = {() => history.push(somethingToDo)}>
      {text}
    </Button>
  );
}
  };
