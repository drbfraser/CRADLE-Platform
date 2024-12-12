import { ColorReading, StatsData } from 'src/shared/api/validation/statistics';

export const initialColorReading: ColorReading = {
  green: 0,
  yellowUp: 0,
  yellowDown: 0,
  redUp: 0,
  redDown: 0,
};

export const initialStatsData: StatsData = {
  patientsReferred: 0,
  sentReferrals: 0,
  daysWithReadings: 0,
  uniquePatientReadings: 0,
  totalReadings: 0,
  colorReadings: initialColorReading,
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
