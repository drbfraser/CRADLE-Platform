import Paper from '@mui/material/Paper';
import { PropsWithChildren } from 'react';

export const DashboardPaper = ({ children }: PropsWithChildren) => {
  return (
    <Paper
      id={'dashboard-container'}
      sx={{
        backgroundColor: '#fff',
      }}>
      {children}
    </Paper>
  );
};
