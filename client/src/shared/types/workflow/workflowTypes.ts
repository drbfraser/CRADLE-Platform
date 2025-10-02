import { ID, ISODate, Nullable } from '../../constants';
import { FormTemplate } from '../form/formTemplateTypes';
import { InstanceStatus, StepStatus } from './workflowEnums';
export interface RuleGroup {
  id: ID;
  rule: string; // JSON object representing a structured rule
  data_sources: string[]; // datasource formatted strings found in a rule
}

//   Template side
export interface TemplateStepBranch {
  // ⇒ workflow_template_step.id
  stepId?: ID;
  // Condition that must evaluate true for the branch to activate
  condition?: RuleGroup;
  targetStepId: ID;
}

export interface TemplateStep {
  id: ID;
  name: string;
  description: string;
  formId?: ID;
  expectedCompletion?: ISODate;
  conditions?: RuleGroup;
  branches?: TemplateStepBranch[];
  lastEdited: ISODate;
}

export interface TemplateStepWithFormAndIndex extends TemplateStep {
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
  initialConditions?: RuleGroup;
  steps: TemplateStep[];
  //startingStepId: ID;

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

// Payload for POST /workflow/templates
export type TemplateInput = Omit<
  WorkflowTemplate,
  'id' | 'archived' | 'dateCreated' | 'lastEdited' | 'lastEditedBy'
>;

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
  formId?: ID;
  assignedTo?: ID;
  expectedCompletion?: Nullable<number>;
  completionDate?: Nullable<number>;
  status: StepStatus;
  data?: Record<string, unknown>;
  workflowInstanceId: ID;
  conditionId?: ID;

  // audit
  lastEdited: number;
  lastUpdatedBy?: ID;
}

export interface WorkflowInstance {
  id: ID;
  name: string;
  description: string;
  workflowTemplateId: ID;
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

// Payload for POST /workflow/instances
export interface FormResponse {
  formId: ID;
  stepId: ID;
  submittedAt: ISODate;
  answers: Record<string, unknown>;
}

export interface InstanceInput {
  templateId: ID;
  patientId: ID;
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
    'status' | 'completionDate' | 'assignedTo' | 'data' | 'lastUpdatedBy'
  >
>;

//  Collections
export type TemplateGroupArray = TemplateGroup[];
