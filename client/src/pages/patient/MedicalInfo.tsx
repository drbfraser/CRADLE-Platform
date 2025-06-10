import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Divider,
  Skeleton,
  SxProps,
  Typography,
  Paper,
} from '@mui/material';
import RecentActorsIcon from '@mui/icons-material/RecentActors';

import { Patient, OrNull } from 'src/shared/types';
import { getPatientMedicalHistoryAsync } from 'src/shared/api';
import { RedirectButton } from 'src/shared/components/Button';

const headerSx: SxProps = {
  display: 'flex',
  marginTop: '10px',
  alignItems: 'center',
  placeContent: 'space-between',
};

interface HistoryItemProps {
  title: string;
  historyRecord: OrNull<string> | undefined;
  editId: string;
  medicalRecordId: string | undefined;
  divider?: boolean;
}

interface IProps {
  patient?: Patient;
  patientId: string;
}

export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const { data: info, isError: errorLoadingInfo } = useQuery({
    queryKey: ['medicalHistory', patientId],
    queryFn: () => getPatientMedicalHistoryAsync(patientId),
  });

  const HistoryItem = ({
    title,
    historyRecord,
    editId,
    medicalRecordId,
  }: HistoryItemProps) => {
    let url = `/patients/${patient?.id}`;
    if (medicalRecordId) {
      url = url.concat(`/edit/${editId}/${medicalRecordId}`);
    } else {
      url = url.concat(`/new/${editId}`);
    }

    return (
      <Box m="20px">
        <Box sx={headerSx}>
          <b>{title}</b>
          <RedirectButton size="small" url={url}>
            {medicalRecordId ? 'Update' : 'Add'}
          </RedirectButton>
        </Box>

        <Box>
          {historyRecord ? (
            <Typography style={{ whiteSpace: 'pre-line' }}>
              {historyRecord}
            </Typography>
          ) : (
            `No additional ${title.toLowerCase()} information.`
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ padding: 3 }}>
      <Box sx={headerSx}>
        <Typography component="h3" variant="h5" sx={headerSx}>
          <RecentActorsIcon fontSize="large" sx={{ marginRight: '8px' }} />
          Medical Information
        </Typography>
        <Link
          to={
            '/history/' + patientId + '/' + patient?.name + '/' + patient?.sex
          }>
          View Past Records
        </Link>
      </Box>

      <Divider />

      {errorLoadingInfo ? (
        <Alert severity="error">
          Something went wrong trying to load patient&rsquo;s medical
          information. Please try refreshing.
        </Alert>
      ) : info ? (
        <>
          <HistoryItem
            title="Medical History"
            historyRecord={info?.medicalHistory}
            editId="medicalHistory"
            medicalRecordId={info.medicalHistoryId}
          />
          <Divider />
          <HistoryItem
            title="Drug History"
            historyRecord={info?.drugHistory}
            editId="drugHistory"
            medicalRecordId={info.drugHistoryId}
          />
        </>
      ) : (
        <Skeleton variant="rectangular" height={200} />
      )}
    </Paper>
  );
};
