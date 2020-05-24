import { TrafficLightEnum } from '../../../../enums';
import { Patient, Reading } from '../../../../types';

export const guid = () =>
  `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0;
    var v = c === `x` ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const getReferralIds = (selectedPatient: Patient): Array<string> => 
selectedPatient.readings
  .filter((reading: Reading): boolean => reading.referral !== null)
  .map(({ referral }: Reading): string => referral);

export const calculateShockIndex = (reading: Reading) => {
  const RED_SYSTOLIC = 160;
  const RED_DIASTOLIC = 110;
  const YELLOW_SYSTOLIC = 140;
  const YELLOW_DIASTOLIC = 90;
  const SHOCK_HIGH = 1.7;
  const SHOCK_MEDIUM = 0.9;

  if (
    reading.bpSystolic === undefined ||
    reading.bpDiastolic === undefined ||
    reading.heartRateBPM === undefined
  ) {
    return TrafficLightEnum.NONE;
  }

  const shockIndex = reading.heartRateBPM / reading.bpSystolic;

  const isBpVeryHigh =
    reading.bpSystolic >= RED_SYSTOLIC ||
    reading.bpDiastolic >= RED_DIASTOLIC;
  const isBpHigh =
    reading.bpSystolic >= YELLOW_SYSTOLIC ||
    reading.bpDiastolic >= YELLOW_DIASTOLIC;
  const isSevereShock = shockIndex >= SHOCK_HIGH;
  const isShock = shockIndex >= SHOCK_MEDIUM;

  if (isSevereShock) {
    return TrafficLightEnum.RED_DOWN;
  } else if (isBpVeryHigh) {
    return TrafficLightEnum.RED_UP;
  } else if (isShock) {
    return TrafficLightEnum.YELLOW_DOWN;
  } else if (isBpHigh) {
    return TrafficLightEnum.YELLOW_UP;
  } 

  return TrafficLightEnum.GREEN;
};

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
  bpSystolicReadingsMonthlyData: any,
  bpDiastolicReadingsMonthlyData: any,
  heartRateReadingsMonthlyData: any,
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
