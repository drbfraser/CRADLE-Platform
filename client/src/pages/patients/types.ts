import { TrafficLightEnum } from 'src/enums';

export interface IPatient {
  patientId: string;
  patientName: string;
  villageNumber: string;
  trafficLightStatus: TrafficLightEnum;
  dateTimeTaken: number;
}
