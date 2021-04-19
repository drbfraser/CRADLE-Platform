import { TrafficLightEnum } from 'src/shared/enums';

export interface IReferral {
  referralId: string;
  patientId: string;
  patientName: string;
  villageNumber: string;
  trafficLightStatus: TrafficLightEnum;
  dateReferred: number;
  isAssessed: boolean;
}
