import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';

import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PrimaryButton } from 'src/shared/components/Button';
import Skeleton from '@mui/material/Skeleton';
import { Box, TableContainer, TextField } from '@mui/material';
import { PropsWithChildren } from 'react';

interface IProps {
  title: string;
  newBtnLabel?: string;
  newBtnOnClick?: () => void;
  uploadBtnLabel?: string;
  uploadBtnLabelOnClick?: () => void;
  search: string;
  setSearch: (search: string) => void;
  columns: MUIDataTableColumnDef[];
  Row: ({ row }: { row: any }) => JSX.Element;
  data: MUIDataTableProps['data'];
  loading: boolean;
  isTransformed: boolean;
}

const TOOLBAR_ELEMENT_HEIGHT_LARGE = '56px';
const TOOLBAR_ELEMENT_HEIGHT_SMALL = '40px';
const TOOLBAR_ELEMENT_SX = {
  '@media (min-width: 900px)': {
    height: TOOLBAR_ELEMENT_HEIGHT_LARGE,
  },
  '@media (max-width: 900px)': {
    height: TOOLBAR_ELEMENT_HEIGHT_SMALL,
  },
};
const MAX_BUTTON_WIDTH = '230px';
const TOOLBAR_BUTTON_SX = {
  maxWidth: MAX_BUTTON_WIDTH,
  '@media (max-width: 720px)': {
    width: MAX_BUTTON_WIDTH,
  },
  '@media (max-width: 360px)': {
    fontSize: '0',
    width: '100%',
    maxWidth: MAX_BUTTON_WIDTH,
  },
  ...TOOLBAR_ELEMENT_SX,
};
const AdminTable = (props: IProps) => {
  const Toolbar = () => (
    <Box
      id={'toolbar-actions'}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        '@media (min-width: 600px)': {
          float: 'right',
        },
        '@media (max-width: 900px)': {
          marginBottom: '10px',
        },
        '@media (max-width: 720px)': {
          flexDirection: 'column',
        },
      }}>
      <Box sx={TOOLBAR_ELEMENT_SX}>
        <TextField
          type="text"
          variant="outlined"
          sx={TOOLBAR_ELEMENT_SX}
          size={props.isTransformed ? 'medium' : 'small'}
          placeholder="Search..."
          value={props.search}
          onChange={(e) => props.setSearch(e.target.value)}
        />
      </Box>
      <Box
        id={'button-container'}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '4px',
          '@media (max-width: 1000px)': {
            flexDirection: 'column',
          },
        }}>
        {props.newBtnLabel && (
          <PrimaryButton sx={TOOLBAR_BUTTON_SX} onClick={props.newBtnOnClick}>
            <AddIcon />
            {props.newBtnLabel}
          </PrimaryButton>
        )}

        {props.uploadBtnLabel && (
          <PrimaryButton
            sx={TOOLBAR_BUTTON_SX}
            onClick={props.uploadBtnLabelOnClick}>
            <FileUploadIcon />
            {props.uploadBtnLabel}
          </PrimaryButton>
        )}
      </Box>
    </Box>
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
              <Skeleton variant="rectangular" component="span" height={40} />
            ) : (
              'Sorry, no matching records found.'
            ),
          },
        },
      }}
    />
  );
};

export const AdminTableContainer = ({ children }: PropsWithChildren) => {
  return (
    <TableContainer
      sx={{
        '& .MuiTableCell-head': {
          fontWeight: 'bold',
        },
        '& button': {
          fontWeight: 'bold',
        },
      }}>
      {children}
    </TableContainer>
  );
};

export default AdminTable;
