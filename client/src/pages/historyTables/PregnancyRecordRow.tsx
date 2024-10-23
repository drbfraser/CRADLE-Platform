import { IconButton, Typography, useTheme } from '@mui/material';

import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PREGNANCY_RECORD_COLUMNS } from './constants';
import { Pregnancy } from 'src/shared/types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { getPrettyDate } from 'src/shared/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ApiTableRow } from 'src/shared/components/apiTable/ApiTableRow';
import { useNavigate } from 'react-router-dom';

interface IProps {
  row: Pregnancy;
  unit: GestationalAgeUnitEnum;
  patientId: string;
  setDeletePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupRecord: React.Dispatch<React.SetStateAction<any>>;
}

export const PregnancyRecordRow = ({
  row,
  unit,
  patientId,
  setDeletePopupOpen,
  setPopupRecord,
}: IProps) => {
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));
  const navigate = useNavigate();

  return (
    <ApiTableRow>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.startDate}
        isTransformed={isTransformed}>
        {getPrettyDate(row.startDate)}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.endDate}
        isTransformed={isTransformed}>
        {row.endDate ? getPrettyDate(row.endDate) : 'Ongoing'}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.gestation}
        isTransformed={isTransformed}>
        {gestationalAgeUnitFormatters[unit ?? GestationalAgeUnitEnum.WEEKS](
          row.startDate,
          row.endDate
        )}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.outcome}
        isTransformed={isTransformed}>
        <Typography
          style={{
            whiteSpace: 'pre-line',
            display: 'inline-block',
            textAlign: 'left',
          }}>
          {row.outcome ? row.outcome : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.action}
        isTransformed={isTransformed}>
        <IconButton
          onClick={() => {
            navigate(
              `/patients/${patientId}/edit/pregnancyInfo/${row.pregnancyId}`
            );
          }}
          size="large">
          <CreateIcon />
        </IconButton>
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
