import React from 'react';
import { useStyles } from './styles';

interface IProps {
  data: Array<any>;
  dataIndex: number;
  rowIndex?: number;
  rowClassName?: string;
  handleRowClick?: (dataIndex: number, rowIndex: number) => void;
}

export const TableRow: React.FC<IProps> = ({
  data,
  dataIndex,
  rowIndex,
  handleRowClick,
  rowClassName,
}) => {
  const classes = useStyles();

  const onClick = (): void => {
    if (rowIndex !== undefined && handleRowClick) {
      handleRowClick(dataIndex, rowIndex);
    }
  };

  return (
    <tr className={`${classes.row} ${rowClassName ?? ``}`} onClick={onClick}>
      {data.map(
        (item: any, index: number): JSX.Element => (
          <td key={`${dataIndex}-${index}`}>{item}</td>
        )
      )}
    </tr>
  );
};

interface IArgs {
  rowClassName?: string;
  handleRowClick?: (dataIndex: number, rowIndex: number) => void;
}

export const customRowRender = ({
  rowClassName,
  handleRowClick,
}: IArgs): ((
  data: Array<any>,
  dataIndex: number,
  rowIndex: number
) => JSX.Element) => {
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
      rowClassName={rowClassName}
      handleRowClick={handleRowClick}
    />
  );
};
