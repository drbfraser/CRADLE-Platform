import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { SexEnum } from 'src/shared/enums';
import {
  getPatientDrugRecordsAsync,
  getPatientMedicalRecordsAsync,
} from 'src/shared/api/api';
import { Tabs } from 'src/shared/components/Tabs/Tabs';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { HistoryTimeline } from './HistoryTimeline';
import { PregnancyHistory } from './PregnancyHistory';
import { MedicalHistory } from './MedicalHistory';

type RouteParams = {
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const navigate = useNavigate();
  const { patientId, patientName, patientSex } = useParams() as RouteParams;

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
          variant="h3"
          component="h3"
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

      <DashboardPaper>
        <Tabs panels={filteredPanels} />
      </DashboardPaper>
    </Box>
  );
}
