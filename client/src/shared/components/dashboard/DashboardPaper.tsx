import { SxProps } from '@mui/material';
import Paper from '@mui/material/Paper';
import { PropsWithChildren } from 'react';

type DashboardPaperProps = PropsWithChildren & {
  sx?: SxProps;
};
export const DashboardPaper = ({ children, sx }: DashboardPaperProps) => {
  return (
    <Paper
      id={'dashboard-container'}
      sx={{
        backgroundColor: '#fff',
        ...sx,
      }}>
      {children}
    </Paper>
  );
};
