import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';
import { PrimaryButton } from 'src/shared/components/Button';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { TextField } from '@mui/material';
import { useAdminStyles } from './adminStyles';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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
      <PrimaryButton className={styles.button} onClick={props.newBtnOnClick}>
        <AddIcon />
        {props.newBtnLabel}
      </PrimaryButton>
    </div>
  );

  return (
    <StyledEngineProvider injectFirst>
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
                  <Skeleton
                    variant="rectangular"
                    component="span"
                    height={40}
                  />
                ) : (
                  'Sorry, no matching records found.'
                ),
              },
            },
          }}
        />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default AdminTable;
