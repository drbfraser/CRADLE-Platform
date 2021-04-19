import { TrafficLightEnum } from 'src/shared/enums';

export type StatsData = {
  patients_referred: number;
  sent_referrals: number;
  days_with_readings: number;
  unique_patient_readings: number;
  total_readings: number;
};

export const initialStatsData: StatsData = {
  patients_referred: 0,
  sent_referrals: 0,
  days_with_readings: 0,
  unique_patient_readings: 0,
  total_readings: 0,
};

export const initialColorReading = {
  [TrafficLightEnum.GREEN]: 0,
  [TrafficLightEnum.YELLOW_UP]: 0,
  [TrafficLightEnum.YELLOW_DOWN]: 0,
  [TrafficLightEnum.RED_UP]: 0,
  [TrafficLightEnum.RED_DOWN]: 0,
};

export interface IExportStatRow {
  referral_date: number;
  parsed_date: string;
  parsed_time: string;
  parsed_pregnant: string;
  patientId: string;
  name: string;
  sex: string;
  age: number;
  pregnant: boolean;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  traffic_color: string;
  traffic_arrow: string;
}
