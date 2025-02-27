import React from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { Box, Typography, Skeleton } from '@mui/material';
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { StatsData } from 'src/shared/api/validation/statistics';
import { TrafficLightEnum } from 'src/shared/enums';
import { trafficLightColors } from 'src/shared/constants';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { StatisticCard } from './StatisticCard';
import { StatisticGroup } from './StatisticGroup';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  statsQuery: UseQueryResult<StatsData>;
}

export const StatisticDashboard: React.FC<IProps> = ({ statsQuery }) => {
  if (statsQuery.isPending || statsQuery.isError) {
    return (
      <Box>
        {statsQuery.isError && <APIErrorToast />}
        <Skeleton variant="rectangular" height={700} />
      </Box>
    );
  }

  const barData = {
    labels: ['Green', 'Yellow Up', 'Yellow Down', 'Red Up', 'Red Down'],
    datasets: [
      {
        label: 'Traffic Light',
        data: [
          statsQuery.data.colorReadings.GREEN,
          statsQuery.data.colorReadings.YELLOW_UP,
          statsQuery.data.colorReadings.YELLOW_DOWN,
          statsQuery.data.colorReadings.RED_UP,
          statsQuery.data.colorReadings.RED_DOWN,
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <StatisticGroup>
        {[
          {
            label: 'Days with Readings',
            value: statsQuery.data.daysWithReadings,
          },
          {
            label: 'Unique Patient Readings',
            value: statsQuery.data.uniquePatientReadings,
          },
          {
            label: 'Total Readings',
            value: statsQuery.data.totalReadings,
          },
          {
            label: 'Patients Referred',
            value: statsQuery.data.patientsReferred,
          },
          {
            label: 'Referrals Sent',
            value: statsQuery.data.sentReferrals,
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
        variant="h2"
        sx={{
          fontSize: '1.7rem',
          fontWeight: '700',
          marginTop: '2rem',
          marginBottom: '1rem',
        }}>
        Reading Traffic Lights
      </Typography>
      <Box
        id="chart-container"
        sx={{
          maxWidth: '100%',
          width: '100%',
          height: '100%',
        }}>
        <Bar data={barData} />
      </Box>
    </Box>
  );
};
