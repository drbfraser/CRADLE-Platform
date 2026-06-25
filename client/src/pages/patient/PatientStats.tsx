import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, Line } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  Alert,
  Box,
  Divider,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { StatsOptionEnum } from 'src/shared/enums';
import { statsUnitLabels } from 'src/shared/constants';
import { getPatientStatisticsAsync } from 'src/shared/api';
import {
  chartOptions,
  getTrafficLightChartData,
  getVitalsChartData,
} from './patientStatsChartData';

Chart.register(
  CategoryScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

enum CHART_OPTION {
  VITALS = 'vitals',
  TRAFFIC_LIGHTS = 'traffic_lights',
}

const UNIT_OPTIONS = Object.values(StatsOptionEnum).map((unit) => ({
  key: unit,
  text: statsUnitLabels[unit],
  value: unit,
}));

const GRAPH_HEIGHT = '400px';

interface IProps {
  patientId: string;
}

export const PatientStats = ({ patientId }: IProps) => {
  const [chartSelected, setChartSelected] = useState(CHART_OPTION.VITALS);
  const [currentStatsUnit, setCurrentStatsUnit] = useState(
    StatsOptionEnum.THIS_YEAR
  );

  const {
    data: patientStats,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['patientStats', patientId],
    queryFn: () => getPatientStatisticsAsync(patientId),
  });

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h5" component="h3">
        <FavoriteIcon fontSize="large" /> Patient Stats
      </Typography>

      <Divider />

      <ToggleButtonGroup
        value={chartSelected}
        exclusive
        sx={{
          width: '100%',
          marginY: '16px',
        }}>
        <ToggleButton
          value={CHART_OPTION.VITALS}
          onClick={() => setChartSelected(CHART_OPTION.VITALS)}
          sx={{ width: '100%' }}>
          {currentStatsUnit === StatsOptionEnum.THIS_YEAR
            ? 'Show Vitals This Year'
            : 'Show Vitals Last 12 Months'}
        </ToggleButton>
        <ToggleButton
          value={CHART_OPTION.TRAFFIC_LIGHTS}
          onClick={() => setChartSelected(CHART_OPTION.TRAFFIC_LIGHTS)}
          sx={{ width: '100%' }}>
          Show Traffic Lights
        </ToggleButton>
      </ToggleButtonGroup>

      {isError ? (
        <Alert severity="error">
          Something went wrong trying to load the stats for that patient. Please
          try refreshing.
        </Alert>
      ) : isPending ? (
        <Skeleton height={GRAPH_HEIGHT} />
      ) : (
        <>
          {chartSelected === CHART_OPTION.VITALS && (
            <>
              <Typography variant="h6" sx={{ fontWeight: '700' }}>
                Average Vitals
              </Typography>

              <Select
                sx={{ minWidth: '160px' }}
                value={currentStatsUnit}
                onChange={(event) => {
                  setCurrentStatsUnit(event.target.value as StatsOptionEnum);
                }}>
                {UNIT_OPTIONS.map((option) => (
                  <MenuItem key={option.key} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ height: GRAPH_HEIGHT, marginTop: '16px' }}>
                <Line
                  data={getVitalsChartData(patientStats, currentStatsUnit)}
                  options={chartOptions}
                />
              </Box>
            </>
          )}
          {chartSelected === CHART_OPTION.TRAFFIC_LIGHTS && (
            <>
              <Typography>Traffic Lights From All Readings:</Typography>
              <Box sx={{ height: GRAPH_HEIGHT }}>
                <Bar
                  data={getTrafficLightChartData(patientStats)}
                  options={chartOptions}
                />
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  );
};
