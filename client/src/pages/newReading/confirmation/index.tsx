import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { FormPageProps } from '../state';

export const Confirmation = (props: FormPageProps) => {
  return (
    <Paper>
      <Box p={2}>
        <h2>Confirmation</h2>
      </Box>
    </Paper>
  )
};
