import { Box, Typography } from '@mui/material';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import { PropsWithChildren, useState } from 'react';
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
import { Tab, Tabs } from '@mui/material';
import { PregnancyHistory } from './PregnancyHistory';
import { MedicalHistory } from './MedicalHistory';

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

  const [activeTabIndex, setActiveTabIndex] = useState(0);

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
        <Typography variant="h4">Past Records of {patientName}</Typography>
      </Box>
      <Box p={3}>
        <Tabs
          value={activeTabIndex}
          onChange={(_event, index) => {
            setActiveTabIndex(index);
          }}>
          {filteredPanels.map((panel) => (
            <Tab label={panel.label} key={panel.label} />
          ))}
        </Tabs>
        {filteredPanels.map((panel, index) => (
          <TabPanel
            key={panel.label}
            index={index}
            activeTabIndex={activeTabIndex}>
            <panel.Component />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}

type TabPanelProps = PropsWithChildren & {
  index: number;
  activeTabIndex: number;
};
const TabPanel = ({ children, index, activeTabIndex }: TabPanelProps) => {
  return index === activeTabIndex ? <>{children}</> : null;
};
