import { TableRow } from '@mui/material';
import { PropsWithChildren, MouseEventHandler } from 'react';

type Props = PropsWithChildren & {
  onClick?: MouseEventHandler<HTMLTableRowElement>;
};
export const ApiTableRow = ({ children, onClick }: Props) => {
  return (
    <TableRow
      onClick={onClick}
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
