import { StatsOptionEnum, TrafficLightEnum } from 'src/shared/enums';
import { PatientStatistics } from 'src/shared/types/patientTypes';
import { trafficLightColors } from 'src/shared/constants';

const MONTHS_IN_YEAR = 12;

export const monthsLabels = [
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

export const chartOptions = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
};

const average = (monthlyArray: number[]) => {
  if (monthlyArray.length === 0) {
    return undefined;
  }
  return (
    monthlyArray.reduce((total, value) => total + value, 0) /
    monthlyArray.length
  );
};

export const getVitalsChartData = (
  stats: PatientStatistics,
  currentStatsUnit: StatsOptionEnum
) => {
  const monthLabelForLastTwelveMonths = [
    ...monthsLabels.slice(stats.currentMonth, 12),
    ...monthsLabels.slice(0, stats.currentMonth),
  ];

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

export const getTrafficLightChartData = (stats: PatientStatistics) => ({
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
