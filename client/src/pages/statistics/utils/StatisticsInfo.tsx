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
import { initialStatsData } from '.';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Bar } from 'react-chartjs-2';
import Skeleton from '@mui/material/Skeleton';
import { TrafficLightEnum } from 'src/shared/enums';
import { trafficLightColors } from 'src/shared/constants';
import { StatisticCard } from './StatisticCard';
import { Box, Typography } from '@mui/material';
import { StatisticGroup } from './StatisticGroup';
import {
  StatsData,
  statsDataSchema,
} from 'src/shared/api/validation/statistics';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  getData: () => Promise<any>;
}

export const StatisticDashboard: React.FC<IProps> = ({ getData }) => {
  const [data, setData] = useState<StatsData>(initialStatsData);
  const [loaded, setLoaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const loadData = async () => {
      try {
        const data = await getData();
        const statsData = await statsDataSchema.parseAsync(data);

        setData(statsData);
        setLoaded(true);
      } catch (e) {
        console.error(e);
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
          data.colorReadings.GREEN,
          data.colorReadings.YELLOW_UP,
          data.colorReadings.YELLOW_DOWN,
          data.colorReadings.RED_UP,
          data.colorReadings.RED_DOWN,
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
          <StatisticGroup>
            {[
              {
                label: 'Days with Readings',
                value: data.daysWithReadings,
              },
              {
                label: 'Unique Patient Readings',
                value: data.uniquePatientReadings,
              },
              {
                label: 'Total Readings',
                value: data.totalReadings,
              },
              {
                label: 'Patients Referred',
                value: data.patientsReferred,
              },
              {
                label: 'Referrals Sent',
                value: data.sentReferrals,
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
          <Typography
            variant={'h2'}
            sx={{
              fontSize: '1.7rem',
              fontWeight: '700',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}>
            Reading Traffic Lights
          </Typography>
          <Box
            id={'chart-container'}
            sx={{
              maxWidth: '100%',
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
