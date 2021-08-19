import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Box, makeStyles } from '@material-ui/core';
import { Form, Select, InputOnChangeData } from 'semantic-ui-react';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Line, Bar } from 'react-chartjs-2';
import { apiFetch, API_URL } from 'src/shared/api';
import Alert from '@material-ui/lab/Alert';
import { Skeleton } from '@material-ui/lab';
import { PatientStatistics } from 'src/shared/types';
import {
  EndpointEnum,
  TrafficLightEnum,
  StatsOptionEnum,
} from 'src/shared/enums';
import { statsUnitLabels } from 'src/shared/constants';
import { trafficLightColors } from 'src/shared/constants';
import { Menu } from 'semantic-ui-react';

interface IProps {
  patientId: string;
}

enum ChartOption {
  VITALS = 'vitals',
  TRAFFIC_LIGHTS = 'traffic_lights',
}

export const PatientStats = ({ patientId }: IProps) => {
  const styles = useStyles();
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
    apiFetch(
      API_URL +
        `${EndpointEnum.PATIENTS}/${patientId}${EndpointEnum.STATISTICS}`
    )
      .then((resp) => resp.json())
      .then((stats) => setPatientStats(stats))
      .catch(() => setErrorLoading(true));
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
        <br />
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
          <div className={styles.graph}>
            {chartSelected === ChartOption.VITALS && (
              <>
                <h4 className={styles.noMargin}>Average Vitals</h4>
                <Form.Field
                  name="statsUnit"
                  control={Select}
                  options={unitOptions}
                  placeholder={statsUnitLabels[currentStatsUnit]}
                  onChange={handleCurrentStatsUnitChange}
                />
                <Line
                  data={getVitalsData(patientStats, currentStatsUnit)}
                  options={{ maintainAspectRatio: false }}
                />
              </>
            )}
            {chartSelected === ChartOption.TRAFFIC_LIGHTS && (
              <>
                <h4 className={styles.noMargin}>
                  Traffic Lights From All Readings:
                </h4>
                <Bar
                  data={getTrafficLightData(patientStats)}
                  options={barChartOptions}
                />
              </>
            )}
          </div>
        ) : (
          <Skeleton height={400} />
        )}
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  noMargin: {
    margin: 0,
  },
  graph: {
    margin: 0,
    maxHeight: 400,
  },
});

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
          : stats.bpSystolicLastTwelveMonths,
    },
    {
      label: 'Diastolic',
      color: '148,0,211',
      data:
        currentStatsUnit === StatsOptionEnum.THIS_YEAR
          ? stats.bpDiastolicReadingsMonthly
          : stats.bpDiastolicLastTwelveMonths,
    },
    {
      label: 'Heart Rate',
      color: '255,127,80',
      data:
        currentStatsUnit === StatsOptionEnum.THIS_YEAR
          ? stats.heartRateReadingsMonthly
          : stats.heartRateBPMLastTwelveMonths,
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

const barChartOptions = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        ticks: {
          fontSize: 10,
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
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
