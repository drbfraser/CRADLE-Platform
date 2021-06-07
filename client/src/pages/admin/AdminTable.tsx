import React from 'react';
import { Button } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { useAdminStyles } from './adminStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
  isTransformed: boolean;
}

const AdminTable = (props: IProps) => {
  const styles = useAdminStyles();
  const isBigScreen = useMediaQuery('(min-width:500px)');

  const theme = (createMuiTheme as any)({
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
        size="large"
        style={{ marginTop: isBigScreen ? 0 : 10 }}
        onClick={props.newBtnOnClick}>
        <AddIcon />
        {props.newBtnLabel}
      </Button>
    </div>
  );

  return (
    <MuiThemeProvider theme={theme}>
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
    </MuiThemeProvider>
  );
};

export default AdminTable;
