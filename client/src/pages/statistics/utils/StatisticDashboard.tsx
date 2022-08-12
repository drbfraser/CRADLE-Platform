import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { initialColorReading, initialStatsData } from '../utils';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Bar } from 'react-chartjs-2';
import Skeleton from '@mui/material/Skeleton';
import { Statistic } from 'semantic-ui-react';
import { TrafficLightEnum } from 'src/shared/enums';
import { trafficLightColors } from 'src/shared/constants';
import { useStatisticsStyles } from './statisticStyles';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  getData: () => Promise<any>;
}

export const StatisticDashboard: React.FC<IProps> = ({ getData }) => {
  const classes = useStatisticsStyles();

  const [data, setData] = useState(initialStatsData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loaded, setloaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setloaded(false);
    const loadData = async () => {
      try {
        const data = await getData();

        setData(data);
        setColorReading(data.color_readings);

        setloaded(true);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadData();
  }, [getData]);

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
    scales: {},
  };

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {!loaded ? (
        <Skeleton variant="rectangular" height={700} />
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
          <h2>Reading Traffic Lights</h2>
          <div className={classes.chart}>
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};
