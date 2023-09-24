import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableProps,
} from 'mui-datatables';

import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PrimaryButton } from 'src/shared/components/Button';
import Skeleton from '@mui/material/Skeleton';
import { TextField } from '@mui/material';
import { useAdminStyles } from './adminStyles';

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

const AdminTable = (props: IProps) => {
  const styles = useAdminStyles();

  const Toolbar = () => (
    <div className={props.isTransformed ? styles.right : ''}>
      <TextField
        type="text"
        variant="outlined"
        className={styles.text}
        size={props.isTransformed ? 'medium' : 'small'}
        placeholder="Search..."
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
      {props.newBtnLabel && (
        <PrimaryButton className={styles.buttonL} onClick={props.newBtnOnClick}>
          <AddIcon />
          {props.newBtnLabel}
        </PrimaryButton>
      )}
      {props.uploadBtnLabel && (
        <PrimaryButton
          className={styles.buttonR}
          onClick={props.uploadBtnLabelOnClick}>
          <FileUploadIcon />
          {props.uploadBtnLabel}
        </PrimaryButton>
      )}
    </div>
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

export default AdminTable;
