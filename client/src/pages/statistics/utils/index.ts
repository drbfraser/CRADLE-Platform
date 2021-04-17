export type Response = {
  patients_referred: number;
  sent_referrals: number;
  days_with_readings: number;
  unique_patient_readings: number;
  total_readings: number;
  color_readings: ColorReading;
};

export type Data = {
  patients_referred: number;
  sent_referrals: number;
  days_with_readings: number;
  unique_patient_readings: number;
  total_readings: number;
};

export type ColorReading = {
  color_readings: TrafficLight;
};

export type TrafficLight = {
  GREEN: number;
  YELLOW_UP: number;
  YELLOW_DOWN: number;
  RED_UP: number;
  RED_DOWN: number;
};

export const initialData: Data = {
  patients_referred: 0,
  sent_referrals: 0,
  days_with_readings: 0,
  unique_patient_readings: 0,
  total_readings: 0,
};

export const initialColorReading: ColorReading = {
  color_readings: {
    GREEN: 0,
    YELLOW_UP: 0,
    YELLOW_DOWN: 0,
    RED_UP: 0,
    RED_DOWN: 0,
  },
};

export interface IStatistic {
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
