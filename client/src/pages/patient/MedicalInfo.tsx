import {
  Alert,
  Box,
  Divider,
  Skeleton,
  SxProps,
  Typography,
} from '@mui/material';
import { Patient, PatientMedicalInfo } from 'src/shared/types';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { OrNull } from 'src/shared/types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { RedirectButton } from 'src/shared/components/Button';
import { getPatientMedicalHistoryAsync } from 'src/shared/api/api';
import ElevatedPaper from './ElevatedPaper';

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
  const [info, setInfo] = useState<PatientMedicalInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const loadMedicalHistory = async () => {
      try {
        setInfo(await getPatientMedicalHistoryAsync(patientId));
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadMedicalHistory();
  }, [patientId]);

  const HistoryItem = ({
    title,
    historyRecord,
    editId,
    medicalRecordId,
  }: HistoryItemProps) => (
    <Box m="20px">
      <Box sx={headerSx}>
        <b>{title}</b>
        <RedirectButton
          size="small"
          url={
            `/patients/${patient?.id}/edit/${editId}` +
            (medicalRecordId ? `/${medicalRecordId}` : '')
          }>
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

  return (
    <ElevatedPaper>
      <Box p={3}>
        <Box sx={headerSx}>
          <Typography component="h3" variant="h5" sx={headerSx}>
            <RecentActorsIcon fontSize="large" />
            &nbsp;Medical Information
          </Typography>
          <Link
            to={
              '/history/' + patientId + '/' + patient?.name + '/' + patient?.sex
            }>
            View Past Records
          </Link>
        </Box>
        <Divider />
        {errorLoading ? (
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
      </Box>
    </ElevatedPaper>
  );
};
