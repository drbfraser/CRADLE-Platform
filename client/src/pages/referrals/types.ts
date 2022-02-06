import { TrafficLightEnum } from 'src/shared/enums';

export interface IReferral {
  referralId: string;
  patientId: string;
  patientName: string;
  villageNumber: string;
  trafficLightStatus: TrafficLightEnum; //this field is got by appending an extra data
  dateReferred: number;
  isAssessed: boolean;
}
