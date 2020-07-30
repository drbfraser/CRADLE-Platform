import React from 'react';
import { useStyles } from './styles';

interface IProps {
  data: Array<any>;
  dataIndex: number;
}

const TableRow: React.FC<IProps> = ({ data, dataIndex }) => {
  const classes = useStyles();

  return (
    <tr className={classes.row}>
      {data.map(
        (item: any, index: number): JSX.Element => (
          <td key={`${dataIndex}-${index}`}>{item}</td>
        )
      )}
    </tr>
  );
};

export const customRowRender = (): ((
  data: Array<any>,
  dataIndex: number
) => JSX.Element) => {
  return (data: Array<any>, dataIndex: number): JSX.Element => (
    <TableRow key={dataIndex} data={data} dataIndex={dataIndex} />
  );
};
