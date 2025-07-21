import { ID, ISODate, Nullable } from '../../constants';
import { InstanceStatus, StepStatus } from './workflowEnums';
export interface RuleGroup {
  id: ID;
  logic: 'AND' | 'OR' | 'NOT';
  rules: string; // JSON blob understood by the rules engine
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
  title: string;
  formId: ID;
  expectedCompletion?: ISODate;
  conditions?: RuleGroup;
  next?: TemplateStepBranch[];

  // audit & soft-delete
  archived: boolean;
  lastEdited: ISODate;
  lastEditedBy: string;
}

export interface WorkflowTemplate {
  id: ID;
  name: string;
  description: string;
  version: number;

  classificationId: ID;
  initialConditions?: RuleGroup;
  steps: TemplateStep[];

  // audit & soft-delete
  archived: boolean;
  dateCreated: ISODate;
  lastEdited: ISODate;
  lastEditedBy: string;
}

// classification type for grouping
export interface WorkflowClassification {
  id: ID;
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
export interface InstanceStep {
  id: ID; // PK on instance_step table
  name: string;
  title?: string; // nullable in DB
  formId: ID;
  assignedTo?: ID;
  expectedCompletion?: ISODate;
  completionDate?: Nullable<ISODate>;
  status: StepStatus;
  data?: Record<string, unknown>;
  triggeredBy?: ID;

  // audit
  lastUpdated: ISODate;
  lastUpdatedBy?: ID;
}

export interface WorkflowInstance {
  id: ID;
  templateId: ID;
  patientId: ID;
  startedDate: number;
  currentStepId?: ID;
  status: InstanceStatus;
  steps: InstanceStep[];

  // audit
  lastUpdated: ISODate;
  lastUpdatedBy?: ID;
  completionDate?: Nullable<ISODate>;
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

// PATCH/PUT payload for /workflow/instances/{id}
/**
 * update status / record currentStep / lastUpdated: what time  / lastUpdateBy who(id)
 */
export type InstanceUpdate = Partial<
  Pick<
    WorkflowInstance,
    'status' | 'currentStepId' | 'lastUpdated' | 'lastUpdatedBy'
  >
>;

export type InstanceStepUpdate = Partial<
  Pick<
    InstanceStep,
    | 'status'
    | 'completionDate'
    | 'assignedTo'
    | 'data'
    | 'lastUpdated'
    | 'lastUpdatedBy'
  >
>;
//  Collections
export type TemplateGroupArray = TemplateGroup[];
