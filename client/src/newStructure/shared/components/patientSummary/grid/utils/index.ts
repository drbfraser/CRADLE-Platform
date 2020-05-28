
const average = (data: any): number => data.reduce(
  (total: number, value: number): number => total + value, 0);

const bpSystolicReadingsMonthly = (data: any): any => data ? ({
  label: `Systolic`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(75, 192, 192, 0.4)`,
  borderColor: `rgba(75, 192, 192, 1)`,
  pointRadius: 1,
  data: Array(12).fill(null).map((
    _: null,
    index: number
  ): number => average(data[index])),
}) : ({});

const bpDiastolicReadingsMonthly = (data: any): any => data ? ({
  label: `Diastolic`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(148, 0, 211, 0.4)`,
  borderColor: `rgba(148, 0, 211, 1)`,
  pointRadius: 1,
  data: Array(12).fill(null).map((
    _: null,
    index: number
  ): number => average(data[index])),
}) : ({});

const heartRateReadingsMonthly = (data: any): any => data ? ({
  label: `Diastolic`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(255, 127, 80, 0.4)`,
  borderColor: `rgba(255, 127, 80, 1)`,
  pointRadius: 1,
  data: Array(12).fill(null).map((
    _: null,
    index: number
  ): number => average(data[index])),
}) : ({});


interface IArgs {
  bpSystolicReadingsMonthlyData: any;
  bpDiastolicReadingsMonthlyData: any;
  heartRateReadingsMonthlyData: any;
}

export const vitalsOverTime = ({
  bpSystolicReadingsMonthlyData,
  bpDiastolicReadingsMonthlyData,
  heartRateReadingsMonthlyData,
}: IArgs): any => ({
  labels: [
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
  ],
  datasets: [
    bpSystolicReadingsMonthly(bpSystolicReadingsMonthlyData),
    bpDiastolicReadingsMonthly(bpDiastolicReadingsMonthlyData),
    heartRateReadingsMonthly(heartRateReadingsMonthlyData),
  ],
});