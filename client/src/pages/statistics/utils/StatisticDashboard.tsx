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
import { TrafficLightEnum } from 'src/shared/enums';
import { trafficLightColors } from 'src/shared/constants';
import { StatisticCard } from './StatisticCard';
import { Box } from '@mui/material';
import { StatisticGroup } from './StatisticGroup';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  getData: () => Promise<any>;
}

export const StatisticDashboard: React.FC<IProps> = ({ getData }) => {
  const [data, setData] = useState(initialStatsData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loaded, setLoaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const loadData = async () => {
      try {
        const data = await getData();

        setData(data);
        setColorReading(data.color_readings);

        setLoaded(true);
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
    <Box>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {!loaded ? (
        <Skeleton variant="rectangular" height={700} />
      ) : (
        <Box
          sx={{
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
          }}>
          {/* <Statistic.Group className={classes.statisticGroup}> */}
          <StatisticGroup>
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
                  <StatisticCard
                    key={stat.label}
                    label={stat.label}
                    data={stat.value}
                  />
                )
            )}
          </StatisticGroup>
          <h2>Reading Traffic Lights</h2>
          <Box
            sx={{
              position: 'relative',
              margin: 'auto',
              width: `100%`,
              height: '100%',
            }}>
            <Bar data={barData} options={options} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
