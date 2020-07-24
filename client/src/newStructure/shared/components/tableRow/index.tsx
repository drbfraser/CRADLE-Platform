import React from 'react';
import { useStyles } from './styles';

interface IProps {
  data: Array<any>;
  dataIndex: number;
  rowIndex: number;
  handleClick: (dataIndex: number, rowIndex: number) => void;
}

const TableRow: React.FC<IProps> = ({
  data,
  dataIndex,
  rowIndex,
  handleClick,
}) => {
  const classes = useStyles();

  const onClick = (): void => {
    handleClick(dataIndex, rowIndex);
  };

  return (
    <tr className={classes.row} onClick={onClick}>
      {data.map(
        (item: any, index: number): JSX.Element => (
          <td key={`${dataIndex}-${index}`}>{item}</td>
        )
      )}
    </tr>
  );
};

export const customRowRender = (
  handleClick: (dataIndex: number, rowIndex: number) => void
): ((data: Array<any>, dataIndex: number, rowIndex: number) => JSX.Element) => {
  return (
    data: Array<any>,
    dataIndex: number,
    rowIndex: number
  ): JSX.Element => (
    <TableRow
      key={dataIndex}
      data={data}
      dataIndex={dataIndex}
      rowIndex={rowIndex}
      handleClick={handleClick}
    />
  );
};
