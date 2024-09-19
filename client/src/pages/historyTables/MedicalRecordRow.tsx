import { IconButton, Typography, useTheme } from '@mui/material';

import DeleteForever from '@mui/icons-material/DeleteForever';
import { MEDICAL_RECORD_COLUMNS } from './constants';
import { MedicalRecord } from 'src/shared/types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { getPrettyDate } from 'src/shared/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ApiTableRow } from 'src/shared/components/apiTable/ApiTableRow';

interface IProps {
  row: MedicalRecord;
  setDeletePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupRecord: React.Dispatch<React.SetStateAction<any>>;
}

export const MedicalRecordRow = ({
  row,
  setDeletePopupOpen,
  setPopupRecord,
}: IProps) => {
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <ApiTableRow>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.dateCreated}
        isTransformed={isTransformed}>
        {getPrettyDate(row.dateCreated)}
      </TableCell>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.information}
        isTransformed={isTransformed}>
        <Typography
          style={{
            whiteSpace: 'pre-line',
            display: 'inline-block',
            textAlign: 'left',
          }}>
          {row.information ? row.information : 'No information'}
        </Typography>
      </TableCell>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.action}
        isTransformed={isTransformed}>
        <IconButton
          onClick={() => {
            setDeletePopupOpen(true);
            setPopupRecord(row);
          }}
          size="large">
          <DeleteForever />
        </IconButton>
      </TableCell>
    </ApiTableRow>
  );
};
