export enum InstanceStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum StepStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum WorkflowViewMode {
  LIST = 'list',
  FLOW = 'flow',
}

export enum InstanceStepAction {
  START = 'start_step',
  COMPLETE = 'complete_step',
}

export enum WorkflowBranchEvaluationStatus {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  NOT_ENOUGH_DATA = 'NOT_ENOUGH_DATA',
}
