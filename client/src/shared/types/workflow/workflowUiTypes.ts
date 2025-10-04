import { ISODate, Nullable } from 'src/shared/constants';
import { InstanceStatus, StepStatus } from './workflowEnums';

export type InstanceStep = {
  id: string;
  title: string;
  description?: string;
  startedOn?: ISODate;
  formId?: string;
  hasForm: boolean;
  expectedCompletion?: Nullable<ISODate>;
  completedOn?: Nullable<ISODate>;
  status: StepStatus;
  nextStep?: string;
  formSubmitted?: boolean;
};

export type PossibleStep = {
  id: string;
  title: string;
  hasForm?: boolean;
  estimate?: number;
  isSkippable?: boolean;
};

export type InstanceDetails = {
  id: string;

  // Summary card
  studyTitle: string;
  patientName: string;
  patientId: string;

  // Details section (sketch fields)
  description: string;
  collection: string;
  version: string;
  firstCreatedOn: string;
  firstCreatedBy?: string;
  lastEditedOn: ISODate;
  lastEditedBy?: string;
  workflowStartedOn: ISODate;
  workflowStartedBy: Nullable<string>;
  workflowCompletedOn?: Nullable<ISODate>;

  // Steps
  steps: InstanceStep[];
  possibleSteps: PossibleStep[];
};

export type WorkflowInstanceProgress = {
  total: number;
  completed: number;
  percent: number;
  estDaysRemaining: number;
  etaDate?: Date;
  currentIndex: number;
};
