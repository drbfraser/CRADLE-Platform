import { TrafficLightEnum } from 'src/shared/enums';

export interface IPatient {
  id: string;
  name: string;
  villageNumber: string;
  trafficLightStatus: TrafficLightEnum;
  dateTaken: number | null;
}
