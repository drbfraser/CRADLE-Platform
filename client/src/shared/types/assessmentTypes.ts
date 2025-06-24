import { OrNull } from "./types";


export type NewAssessment = {
  diagnosis: string;
  treatment: string;
  specialInvestigations: string;
  medicationPrescribed: string;
  followUpNeeded: boolean;
  followUpInstructions: OrNull<string>;
  healthcareWorkerId: number | undefined;
};

export type Assessment = NewAssessment & {
  id: number;
  dateAssessed: number;
  healthcareWorkerId: string;
  readingId: string;
  //add Spring 2022
  patientId: string;
};