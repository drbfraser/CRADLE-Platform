import React from 'react';
import { Button } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';
import { useAdminStyles } from './adminStyles';

interface IProps {
  title: string;
  newBtnLabel: string;
  newBtnOnClick: () => void;
  search: string;
  setSearch: (search: string) => void;
  columns: MUIDataTableColumnDef[];
  Row: ({ row }: { row: any[] }) => JSX.Element;
  data: MUIDataTableProps['data'];
  loading: boolean;
}

const AdminTable = (props: IProps) => {
  const styles = useAdminStyles();

  const Toolbar = () => (
    <>
      <div className="centered-flexbox margin">
        <TextField
          type="text"
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={props.search}
          onChange={(e) => props.setSearch(e.target.value)}
        />
      </div>

      <div className="centered-flexbox margin">
        <Button
          className={styles.button}
          color="primary"
          variant="contained"
          size="large"
          onClick={props.newBtnOnClick}>
          <AddIcon />
          {props.newBtnLabel}
        </Button>
      </div>
    </>
  );

  return (
    <MUIDataTable
      title={props.title}
      columns={props.columns}
      data={props.data}
      options={{
        elevation: 0,
        search: false,
        download: false,
        print: false,
        viewColumns: false,
        filter: false,
        selectToolbarPlacement: 'none',
        selectableRows: 'none',
        rowHover: false,
        responsive: 'standard',
        customToolbar: Toolbar,
        customRowRender: (row, i) => <props.Row key={i} row={row} />,
        textLabels: {
          body: {
            noMatch: props.loading ? (
              <Skeleton variant="rect" component="span" height={40} />
            ) : (
              'Sorry, no matching records found.'
            ),
          },
        },
      }}
    />
  );
};

export default AdminTable;
