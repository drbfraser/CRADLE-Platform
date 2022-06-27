import { Button, TextField } from '@material-ui/core';
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { useAdminStyles } from './adminStyles';

interface IProps {
  title: string;
  newBtnLabel: string;
  newBtnOnClick: () => void;
  search: string;
  setSearch: (search: string) => void;
  columns: MUIDataTableColumnDef[];
  Row: ({ row }: { row: any }) => JSX.Element;
  data: MUIDataTableProps['data'];
  loading: boolean;
  isTransformed: boolean;
}

const AdminTable = (props: IProps) => {
  const styles = useAdminStyles();

  const theme = (createTheme as any)({
    overrides: {
      MUIDataTable: {
        responsiveScroll: {
          maxHeight: props.isTransformed ? '' : 'none',
        },
      },
    },
  });

  const Toolbar = () => (
    <div className={props.isTransformed ? styles.right : ''}>
      <TextField
        type="text"
        variant="outlined"
        size={props.isTransformed ? 'medium' : 'small'}
        placeholder="Search..."
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
      <Button
        className={styles.button}
        color="primary"
        variant="contained"
        onClick={props.newBtnOnClick}>
        <AddIcon />
        {props.newBtnLabel}
      </Button>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

export default AdminTable;
