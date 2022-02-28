import { TrafficLightEnum } from 'src/shared/enums';

export interface IReferral {
  referralId: string;
  patientId: string;
  patientName: string;
  villageNumber: string;
  //trafficLightStatus changed to 'vitalSign' in 2022 Spring
  vitalSign: TrafficLightEnum;
  dateReferred: number;
  isAssessed: boolean;
  //added 2022 Spring
  notAttended: boolean;
  isCancelled: boolean;
}
