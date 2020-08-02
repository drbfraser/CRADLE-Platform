import React from 'react';
import { TableRow } from '../../../../shared/components/table/row';

export const customRowRender = (
  rowClassName: string
): ((data: Array<any>, dataIndex: number) => JSX.Element) => {
  return (data: Array<any>, dataIndex: number): JSX.Element => (
    <TableRow
      key={dataIndex}
      data={data}
      dataIndex={dataIndex}
      rowClassName={rowClassName}
    />
  );
};
