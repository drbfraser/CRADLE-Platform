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
import { Box, Divider, Paper, Typography } from '@mui/material';
import { Form, InputOnChangeData, Select } from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import { StatsOptionEnum, TrafficLightEnum } from 'src/shared/enums';
import { statsUnitLabels, trafficLightColors } from 'src/shared/constants';

import Alert from '@mui/material/Alert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Menu } from 'semantic-ui-react';
import { PatientStatistics } from 'src/shared/types';
import { Skeleton } from '@mui/material';
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

interface IProps {
  patientId: string;
}

enum ChartOption {
  VITALS = 'vitals',
  TRAFFIC_LIGHTS = 'traffic_lights',
}

const GRAPH_HEIGHT = '400px';

export const PatientStats = ({ patientId }: IProps) => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [chartSelected, setChartSelected] = useState(ChartOption.VITALS);
  const [patientStats, setPatientStats] = useState<PatientStatistics>();
  const [currentStatsUnit, setCurrentStatsUnit] = useState(
    StatsOptionEnum.THIS_YEAR
  );
  const unitOptions = Object.values(StatsOptionEnum).map((unit) => ({
    key: unit,
    text: statsUnitLabels[unit],
    value: unit,
  }));

  useEffect(() => {
    const loadPatientStats = async () => {
      try {
        const stats: PatientStatistics = await getPatientStatisticsAsync(
          patientId
        );
        setPatientStats(stats);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadPatientStats();
  }, [patientId]);

  const handleCurrentStatsUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setCurrentStatsUnit(value as StatsOptionEnum);
  };

  return (
    <Paper>
      <Box p={3}>
        <Typography variant="h5" component="h3">
          <FavoriteIcon fontSize="large" /> &nbsp; Patient Stats
        </Typography>
        <Divider />
        <Menu fluid widths={2}>
          <Menu.Item
            name={
              currentStatsUnit === StatsOptionEnum.THIS_YEAR
                ? 'Show Vitals This Year'
                : 'Show Vitals Last 12 Months'
            }
            active={chartSelected === ChartOption.VITALS}
            onClick={() => setChartSelected(ChartOption.VITALS)}
          />
          <Menu.Item
            name="Show Traffic Lights"
            active={chartSelected === ChartOption.TRAFFIC_LIGHTS}
            onClick={() => setChartSelected(ChartOption.TRAFFIC_LIGHTS)}
          />
        </Menu>
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load the stats for that patient.
            Please try refreshing.
          </Alert>
        ) : patientStats ? (
          <>
            {chartSelected === ChartOption.VITALS && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    margin: '0px',
                    fontWeight: '700',
                  }}>
                  Average Vitals
                </Typography>
                <Form.Field
                  name="statsUnit"
                  control={Select}
                  options={unitOptions}
                  placeholder={statsUnitLabels[currentStatsUnit]}
                  onChange={handleCurrentStatsUnitChange}
                />
                <Box
                  sx={{
                    height: GRAPH_HEIGHT,
                  }}>
                  <Line
                    data={getVitalsData(patientStats, currentStatsUnit)}
                    options={options}
                  />
                </Box>
              </>
            )}
            {chartSelected === ChartOption.TRAFFIC_LIGHTS && (
              <>
                <Typography
                  sx={{
                    margin: '0px',
                  }}>
                  Traffic Lights From All Readings:
                </Typography>
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
        ) : (
          <Skeleton height={400} />
        )}
      </Box>
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
