import { Paper } from '@mui/material';
import { PropsWithChildren } from 'react';

export const CardContainer = ({ children }: PropsWithChildren) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        my: 1,
        backgroundColor: '#f9f9f9',
      }}>
      {children}
    </Paper>
  );
};
