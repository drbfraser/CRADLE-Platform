import { TableRow } from '@mui/material';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren;
export const ApiTableRow = ({ children }: Props) => {
  return (
    <TableRow
      sx={{
        cursor: 'pointer',
        borderTop: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
        '&:hover': {
          backgroundColor: '#f8f8f8',
        },
      }}>
      {children}
    </TableRow>
  );
};
