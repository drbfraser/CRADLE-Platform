import { ISODate, Nullable } from 'src/shared/constants';
import {
  InstanceStatus,
  StepStatus,
  WorkflowBranchEvaluationStatus,
} from './workflowEnums';
import { CForm } from '../form/formTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { WorkflowBranchVarResolution } from './workflowApiTypes';

export type InstanceStep = {
  id: string;
  title: string;
  description?: string;
  startedOn?: ISODate;
  formTemplateId?: string;
  expectedCompletion?: Nullable<ISODate>;
  completedOn?: Nullable<ISODate>;
  status: StepStatus;
  nextStep?: string;
  form?: CForm;
  formId?: string;
  formSubmitted?: boolean;
  workflowTemplateStepId: string;
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

export type FormModalState = {
  open: boolean;
  renderState: FormRenderStateEnum;
  form: CForm | null;
};

export type WorkflowInfoRow = {
  id: string;
  instanceTitle: string;
  templateId: string;
  templateName: string;
  collection: string;
  status: InstanceStatus;
  lastEdited: number;
  stepsCount: number;
  currentStepLabel: string;
};

export type WorkflowNextStepOption = {
  branchId: string;
  stepId: string;
  title: string;
  isRecommended: boolean;
  rule: string;
  ruleStatus: WorkflowBranchEvaluationStatus;
  varResolutions: WorkflowBranchVarResolution[];
};
