import { Box, Typography } from '@mui/material';
import { SexEnum } from 'src/shared/enums';
import { useState } from 'react';
import {
  getPatientDrugRecordsAsync,
  getPatientMedicalRecordsAsync,
} from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { HistoryTimeline } from './HistoryTimeline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { PregnancyHistory } from './PregnancyHistory';
import { MedicalHistory } from './MedicalHistory';
import { Tabs } from 'src/shared/components/Tabs/Tabs';

type RouteParams = {
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const { patientId, patientName, patientSex } = useParams() as RouteParams;
  const [submitError, setSubmitError] = useState(false);

  const navigate = useNavigate();

  const allPanels = [
    {
      label: 'Pregnancy History',
      Component: PregnancyHistory,
    },
    {
      label: 'Medical History',
      Component: () => (
        <MedicalHistory
          title={'Medical History'}
          fetchRecords={getPatientMedicalRecordsAsync}
        />
      ),
    },
    {
      label: 'Drug History',
      Component: () => (
        <MedicalHistory
          title={'Drug History'}
          fetchRecords={getPatientDrugRecordsAsync}
        />
      ),
    },
    {
      label: 'Timeline',
      Component: HistoryTimeline,
    },
  ];

  const filteredPanels =
    patientSex === SexEnum.MALE
      ? allPanels.filter((obj) => obj.label !== 'Pregnancy History')
      : allPanels;

  return (
    <Box>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Box
        sx={{
          clear: 'right',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/patients/${patientId ?? ''}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography
          variant={'h3'}
          component={'h3'}
          sx={{
            fontSize: {
              lg: 'xxx-large',
              md: 'xx-large',
              xs: 'x-large',
            },
          }}>
          Past Records of {patientName}
        </Typography>
      </Box>
      <Tabs panels={filteredPanels} />
    </Box>
  );
}
