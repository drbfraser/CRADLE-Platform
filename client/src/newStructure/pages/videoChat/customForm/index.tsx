import { Button, Form } from 'semantic-ui-react';

import React from 'react';
import classes from './styles.module.css';

interface IProps {
  onRoomIdChange: any;
  onSubmit: any;
}

export const CustomForm: React.FC<IProps> = ({ onRoomIdChange, onSubmit }) => {
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => 
    onRoomIdChange(e.target.value);

  const handleSubmit = (): void => onSubmit();

  return (
    <div className={classes.container}>
      <Form>
        <label>
          Room ID:<span>&nbsp;</span>
          <input
            className={classes.input}
            type="text"
            onChange={handleRoomIdChange}
            placeholder="Enter room ID..."
          />
        </label>
        <br />
        <br />
        <Button variant="contained" onClick={handleSubmit}>
          Enter
        </Button>
      </Form>
    </div>
  );
};
