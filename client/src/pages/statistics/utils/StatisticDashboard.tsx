import { Statistic } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import { useStatisticsStyles } from './statisticStyles';
import { Bar } from 'react-chartjs-2';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { initialStatsData, initialColorReading } from '../utils';
import Skeleton from '@material-ui/lab/Skeleton';
import { apiFetch } from 'src/shared/api';
import { trafficLightColors } from 'src/shared/constants';
import { TrafficLightEnum } from 'src/shared/enums';

interface IProps {
  url: string;
}

export const StatisticDashboard: React.FC<IProps> = ({ url }) => {
  const classes = useStatisticsStyles();

  const [data, setData] = useState(initialStatsData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loaded, setloaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setloaded(false);
    apiFetch(url)
      .then((response) => response.json())
      .then((response) => {
        setData(response);
        setColorReading(response.color_readings);
        setloaded(true);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [url]);

  const barData = {
    labels: ['Green', 'Yellow Up', 'Yellow Down', 'Red Up', 'Red Down'],
    datasets: [
      {
        label: 'Traffic Light',
        data: [
          colorReading[TrafficLightEnum.GREEN],
          colorReading[TrafficLightEnum.YELLOW_UP],
          colorReading[TrafficLightEnum.YELLOW_DOWN],
          colorReading[TrafficLightEnum.RED_UP],
          colorReading[TrafficLightEnum.RED_DOWN],
        ],
        backgroundColor: [
          trafficLightColors[TrafficLightEnum.GREEN],
          trafficLightColors[TrafficLightEnum.YELLOW_UP],
          trafficLightColors[TrafficLightEnum.YELLOW_DOWN],
          trafficLightColors[TrafficLightEnum.RED_UP],
          trafficLightColors[TrafficLightEnum.RED_DOWN],
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
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

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {!loaded ? (
        <Skeleton variant="rect" height={700} />
      ) : (
        <div className={classes.center}>
          <Statistic.Group className={classes.statisticGroup}>
            {[
              {
                label: 'Days with Readings',
                value: data.days_with_readings,
              },
              {
                label: 'Unique Patient Readings',
                value: data.unique_patient_readings,
              },
              {
                label: 'Total Readings',
                value: data.total_readings,
              },
              {
                label: 'Patients Referred',
                value: data.patients_referred,
              },
              {
                label: 'Referrals Sent',
                value: data.sent_referrals,
              },
            ].map(
              (stat, i) =>
                stat.value !== undefined && (
                  <Statistic key={i} horizontal className={classes.statistic}>
                    <Statistic.Value>{stat.value}</Statistic.Value>
                    <Statistic.Label className={classes.verticalWriting}>
                      {stat.label}
                    </Statistic.Label>
                  </Statistic>
                )
            )}
          </Statistic.Group>
          <br />

          <h2>Reading Traffic Lights</h2>
          <div className={classes.chart}>
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};
