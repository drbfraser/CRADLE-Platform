import { StatisticsDataset, YearGlobalStatistics } from 'src/types';

export const readingsPerMonth = (
  data: YearGlobalStatistics
): StatisticsDataset<
  'Total Number of Readings',
  YearGlobalStatistics,
  'rgba(75,192,192,0.4)'
> => ({
  label: `Total Number of Readings`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(75,192,192,0.4)`,
  borderColor: `rgba(75,192,192,1)`,
  pointRadius: 1,
  data,
});

export const referralsPerMonth = (
  data: YearGlobalStatistics
): StatisticsDataset<
  'Total Number of Referrals',
  YearGlobalStatistics,
  'rgba(148,0,211,0.4)'
> => ({
  label: `Total Number of Referrals`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(148,0,211,0.4)`,
  borderColor: `rgba(148,0,211,1)`,
  pointRadius: 1,
  data,
});

export const assessmentsPerMonth = (
  data: YearGlobalStatistics
): StatisticsDataset<
  'Total Number of Assesments',
  YearGlobalStatistics,
  'rgba(255,127,80,0.4)'
> => ({
  label: `Total Number of Assesments`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(255,127,80,0.4)`,
  borderColor: `rgba(255,127,80,1)`,
  pointRadius: 1,
  data,
});
