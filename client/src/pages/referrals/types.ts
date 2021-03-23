import { TrafficLightEnum } from 'src/enums';

export interface IReferral {
  referralId: string;
  patientId: string;
  patientName: string;
  villageNumber: string;
  trafficLightStatus: TrafficLightEnum;
  dateReferred: number;
  isAssessed: boolean;
}
