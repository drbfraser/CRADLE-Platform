import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Box } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Line, Bar } from 'react-chartjs-2';
import { Button } from 'semantic-ui-react';
import { BASE_URL } from 'src/server/utils';
import { apiFetch } from 'src/shared/utils/api';
import { EndpointEnum } from 'src/server';
import Alert from '@material-ui/lab/Alert';
import { Skeleton } from '@material-ui/lab';
import { PatientStatistics } from 'src/types';
import { MonthEnum, TrafficLightEnum } from 'src/enums';

interface IProps {
  patientId: string;
}

enum ChartOption {
  VITALS = 'vitals',
  TRAFFIC_LIGHTS = 'traffic_lights',
}

export const VitalsGraph = ({ patientId }: IProps) => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [chartSelected, setChartSelected] = useState(ChartOption.VITALS);
  const [patientStats, setPatientStats] = useState<PatientStatistics>();

  useEffect(() => {
    apiFetch(
      BASE_URL +
        `${EndpointEnum.PATIENTS}/${patientId}${EndpointEnum.STATISTICS}`
    )
      .then((resp) => resp.json())
      .then((stats) => setPatientStats(stats))
      .catch(() => setErrorLoading(true));
  }, [patientId]);

  return (
    <Paper>
      <Box p={3}>
        <Typography variant="h5" component="h3">
          <FavoriteIcon fontSize="large" /> &nbsp; Vitals Over Time
        </Typography>
        <Divider />
        <br />
        <Button.Group fluid={true}>
          <Button
            active={chartSelected === ChartOption.VITALS}
            onClick={() => setChartSelected(ChartOption.VITALS)}>
            Show Vitals Over Time
          </Button>
          <Button
            active={chartSelected === ChartOption.TRAFFIC_LIGHTS}
            onClick={() => setChartSelected(ChartOption.TRAFFIC_LIGHTS)}>
            Show Traffic Lights
          </Button>
        </Button.Group>
        {errorLoading ? (
          <>
            <br />
            <br />
            <Alert severity="error">
              Something went wrong trying to load the vitals for that patient.
              Please try refreshing.
            </Alert>
          </>
        ) : patientStats ? (
          <div>
            {chartSelected === ChartOption.VITALS && (
              <>
                <h4>Average Vitals Over Time:</h4>
                <Line data={getVitalsData(patientStats)} />
              </>
            )}
            {chartSelected === ChartOption.TRAFFIC_LIGHTS && (
              <>
                <h4>Traffic Lights From All Readings:</h4>
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

const getVitalsData = (stats: PatientStatistics) => {
  const MONTHS_IN_YEAR = 12;

  const average = (monthlyArray: number[]) => {
    return (
      monthlyArray.reduce((total, value) => total + value, 0) /
      monthlyArray.length
    );
  };

  const datasets = [
    {
      label: 'Systolic',
      color: '75,192,192',
      data: stats.bpSystolicReadingsMonthly,
    },
    {
      label: 'Diastolic',
      color: '148,0,211',
      data: stats.bpDiastolicReadingsMonthly,
    },
    {
      label: 'Heart Rate',
      color: '255,127,80',
      data: stats.heartRateReadingsMonthly,
    },
  ];

  return {
    labels: Object.values(MonthEnum),
    datasets: datasets.map((d) => ({
      label: d.label,
      fill: false,
      lineTension: 0.1,
      backgroundColor: `rgba(${d.color},0.4)`,
      borderColor: `rgba(${d.color},1)`,
      pointRadius: 5,
      data: d.data
        ? Array(MONTHS_IN_YEAR).map((_, i) => average(d.data?.[i] ?? []))
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
      backgroundColor: [`green`, `yellow`, `yellow`, `red`, `red`],
      data: Object.values(stats.trafficLightCountsFromDay1),
    },
  ],
});

const barChartOptions = {
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
