import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import React from 'react';

export type TextInputProps = TextFieldProps;

export const TextInput: React.FC<TextInputProps> = (props) => {
  return (
    <TextField
      fullWidth={true}
      required={true}
      rows={5}
      type="text"
      variant="outlined"
      {...props}
    />
  );
};
