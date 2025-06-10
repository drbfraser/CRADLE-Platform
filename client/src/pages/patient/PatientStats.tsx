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

import { StatsOptionEnum, TrafficLightEnum } from 'src/shared/enums';
import { PatientStatistics } from 'src/shared/types';
import { statsUnitLabels, trafficLightColors } from 'src/shared/constants';
import { getPatientStatisticsAsync } from 'src/shared/api';

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
          onClick={() => {
            setChartSelected(CHART_OPTION.VITALS);
          }}
          sx={{
            width: '100%',
          }}>
          {currentStatsUnit === StatsOptionEnum.THIS_YEAR
            ? 'Show Vitals This Year'
            : 'Show Vitals Last 12 Months'}
        </ToggleButton>
        <ToggleButton
          value={CHART_OPTION.TRAFFIC_LIGHTS}
          onClick={() => {
            setChartSelected(CHART_OPTION.TRAFFIC_LIGHTS);
          }}
          sx={{
            width: '100%',
          }}>
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '700',
                }}>
                Average Vitals
              </Typography>

              <Select
                sx={{
                  minWidth: '160px',
                }}
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

              <Box
                sx={{
                  height: GRAPH_HEIGHT,
                  marginTop: '16px',
                }}>
                <Line
                  data={getVitalsData(patientStats, currentStatsUnit)}
                  options={options}
                />
              </Box>
            </>
          )}
          {chartSelected === CHART_OPTION.TRAFFIC_LIGHTS && (
            <>
              <Typography>Traffic Lights From All Readings:</Typography>
              <Box
                sx={{
                  height: GRAPH_HEIGHT,
                }}>
                <Bar
                  data={getTrafficLightData(patientStats)}
                  options={options}
                />
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  );
};

const getVitalsData = (
  stats: PatientStatistics,
  currentStatsUnit: StatsOptionEnum
) => {
  const MONTHS_IN_YEAR = 12;
  const monthLabelForLastTwelveMonths = [
    ...monthsLabels.slice(stats.currentMonth, 12),
    ...monthsLabels.slice(0, stats.currentMonth),
  ];

  const average = (monthlyArray: number[]) => {
    if (monthlyArray.length === 0) {
      return undefined;
    }

    return (
      monthlyArray.reduce((total, value) => total + value, 0) /
      monthlyArray.length
    );
  };

  const datasets = [
    {
      label: 'Systolic',
      color: '75,192,192',
      data:
        currentStatsUnit === StatsOptionEnum.THIS_YEAR
          ? stats.bpSystolicReadingsMonthly
          : stats.bpSystolicReadingsLastTwelveMonths,
    },
    {
      label: 'Diastolic',
      color: '148,0,211',
      data:
        currentStatsUnit === StatsOptionEnum.THIS_YEAR
          ? stats.bpDiastolicReadingsMonthly
          : stats.bpDiastolicReadingsLastTwelveMonths,
    },
    {
      label: 'Heart Rate',
      color: '255,127,80',
      data:
        currentStatsUnit === StatsOptionEnum.THIS_YEAR
          ? stats.heartRateReadingsMonthly
          : stats.heartRateReadingsLastTwelveMonths,
    },
  ];

  return {
    labels:
      currentStatsUnit === StatsOptionEnum.THIS_YEAR
        ? monthsLabels
        : monthLabelForLastTwelveMonths,
    datasets: datasets.map((d) => ({
      label: d.label,
      fill: true,
      lineTension: 0.1,
      backgroundColor: `rgba(${d.color},0.4)`,
      borderColor: `rgba(${d.color},1)`,
      pointRadius: 5,
      data: d.data
        ? Array(MONTHS_IN_YEAR)
            .fill(null)
            .map((_, i) => average(d.data?.[i] ?? []))
        : [],
    })),
  };
};

const getTrafficLightData = (stats: PatientStatistics) => ({
  labels: Object.values(TrafficLightEnum)
    .filter((value) => value !== TrafficLightEnum.NONE)
    .map((value) => value.replace('_', ' ')),
  datasets: [
    {
      backgroundColor: [
        trafficLightColors[TrafficLightEnum.GREEN],
        trafficLightColors[TrafficLightEnum.YELLOW_UP],
        trafficLightColors[TrafficLightEnum.YELLOW_DOWN],
        trafficLightColors[TrafficLightEnum.RED_UP],
        trafficLightColors[TrafficLightEnum.RED_DOWN],
      ],
      data: Object.values(stats.trafficLightCountsFromDay1),
    },
  ],
});

const options = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
};

const monthsLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
