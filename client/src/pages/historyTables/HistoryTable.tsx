import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

interface IProps {
  rows: any;
  columns: string[];
  isTransformed: boolean;
}

export const HistoryTable: React.FC<IProps> = ({ rows, columns, isTransformed }) => {

  return (
    <TableContainer>
      <Table>
      {isTransformed && <TableHead>
          <TableRow>
            {columns.map((colName, index) => (
              <TableCell key={index}>{colName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
      }
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
