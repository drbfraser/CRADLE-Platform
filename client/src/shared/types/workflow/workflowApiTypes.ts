import { ID, ISODate, Nullable } from '../../constants';
import { FormTemplate } from '../form/formTemplateTypes';
import { CForm } from '../form/formTypes';
import {
  InstanceStatus,
  InstanceStepAction,
  StepStatus,
  WorkflowBranchEvaluationStatus,
} from './workflowEnums';
export interface RuleGroup {
  id: ID;
  rule: string; // JSON object representing a structured rule
}

//   Template side
export interface WorkflowTemplateStepBranch {
  id?: ID;
  stepId: ID;
  conditionId?: ID;
  condition?: RuleGroup;
  targetStepId: ID;
}

export interface WorkflowTemplateStep {
  id: ID;
  name: string;
  description: string;
  formId?: ID;
  expectedCompletion?: number;
  branches?: WorkflowTemplateStepBranch[];
  lastEdited: number | string;
  workflowTemplateId?: ID;
}

export interface WorkflowTemplateStepWithFormAndIndex
  extends WorkflowTemplateStep {
  form?: FormTemplate;
  index: number;
  branchIndices?: number[];
}

export interface WorkflowTemplate {
  id: ID;
  name: string;
  description: string;
  version: string;

  classificationId: ID;
  classification?: WorkflowClassification;
  steps: WorkflowTemplateStep[];
  startingStepId?: ID;

  // multilingual
  availableLanguages?: string[];

  // audit & soft-delete
  archived: boolean;
  dateCreated: number;
  lastEdited: number;
  lastEditedBy: string;
}

// classification type for grouping
export interface WorkflowClassification {
  id: ID;
  name: string;
}

// Payload for POST /workflow/classifications
export interface ClassificationInput {
  name: string;
}

/**
 * A name that may be either a plain string (treated as English by the backend)
 * or a { language: text } dict for explicit multilingual support.
 */
export type MultiLangText = string | Record<string, string>;

/** Step payload that accepts multilang names for create/edit. */
export interface WorkflowTemplateStepInput
  extends Omit<WorkflowTemplateStep, 'name'> {
  name: MultiLangText;
}

// Payload for POST /workflow/templates/body
export interface TemplateInput
  extends Omit<
    WorkflowTemplate,
    | 'id'
    | 'dateCreated'
    | 'lastEdited'
    | 'lastEditedBy'
    | 'name'
    | 'steps'
    | 'classification'
  > {
  name: MultiLangText;
  steps: WorkflowTemplateStepInput[];
  /** When creating, the classification may be auto-generated from the name and
   *  therefore won't have an id yet. */
  classification?: { id?: ID; name: MultiLangText } | null;
}

// Optional grouping structure used by listTemplates?groupBy=classification
export interface TemplateGroup {
  classification: { id: ID; name: string };
  templates: WorkflowTemplate[];
}

// Instance side
export interface WorkflowInstanceStep {
  id: ID; // PK on instance_step table
  name: string;
  description: string;
  startDate: number;
  triggeredBy?: ID;
  formId?: string;
  form?: CForm;
  assignedTo?: ID;
  expectedCompletion?: Nullable<number>;
  completionDate?: Nullable<number>;
  status: StepStatus;
  data?: Record<string, unknown>;
  workflowInstanceId: ID;
  workflowTemplateStepId: ID;

  // audit
  lastEdited: number;
  lastUpdatedBy?: ID;
}

export interface WorkflowInstance {
  id: ID;
  name: string;
  description: string;
  workflowTemplateId: ID;
  workflowTemplateStepId: ID;
  patientId: ID;
  startDate: number;
  currentStepId?: ID;
  status: InstanceStatus;
  steps: WorkflowInstanceStep[];

  // audit
  lastEdited: number;
  lastEditedBy?: ID;
  completionDate?: number;
}

export interface WorkflowInstanceActionsResponse {
  actions: WorkflowInstanceAction[];
}

export interface WorkflowInstanceAction {
  stepId: ID;
  type: InstanceStepAction;
}

export interface ApplyInstanceStepActionRequest {
  action: {
    type: InstanceStepAction;
    step_id: ID;
  };
}

export interface OverrideStepRequest {
  workflowInstanceStepId: ID;
}

export interface WorkflowBranchVarResolution {
  var: string;
  value: number | null;
  status: string;
}

export interface WorkflowBranchEvaluation {
  branchId: ID;
  rule: string;
  varResolutions: WorkflowBranchVarResolution[];
  ruleStatus: WorkflowBranchEvaluationStatus;
}

export interface WorkflowInstanceStepEvaluation {
  branchEvaluations: WorkflowBranchEvaluation[];
  selectedBranchId: ID;
}

// Payload for POST /workflow/instances
export interface FormResponse {
  formId: ID;
  stepId: ID;
  submittedAt: ISODate;
  answers: Record<string, unknown>;
}

export interface InstanceInput {
  workflowTemplateId: ID;
  patientId: ID;
  name?: string;
  description?: string;
  formResponses?: FormResponse[];
}

// To be used for PATCH payloads for /workflow/instances/{id}
/**
 * update status / record currentStep / lastEditedBy: who(id)
 */
export type InstanceUpdate = Partial<
  Pick<WorkflowInstance, 'status' | 'currentStepId' | 'lastEditedBy'>
>;

export type InstanceStepUpdate = Partial<
  Pick<
    WorkflowInstanceStep,
    | 'status'
    | 'completionDate'
    | 'assignedTo'
    | 'data'
    | 'lastUpdatedBy'
    | 'formId'
  >
>;

//  Collections
export type TemplateGroupArray = TemplateGroup[];
