//workflow instance
import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';
import { ID } from '../../constants';
import {
  WorkflowInstance,
  InstanceInput,
  InstanceUpdate,
  WorkflowInstanceStep,
  InstanceStepUpdate,
} from '../../types/workflow/workflowApiTypes';

//full path
const INSTANCES = EndpointEnum.WORKFLOW_INSTANCES;
//which specific instance
const instancePath = (id: ID) => `${INSTANCES}/${id}`;
//instance step path
const instanceStepsPath = (id: ID) => `${instancePath(id)}/steps`;
//which specific step
const instanceStepByIdPath = (id: ID, stepId: ID) =>
  `${instanceStepsPath(id)}/${stepId}`;

//curd - Workflow Instances
/**
 * get all instances via patient id
 * @param params
 */
export const getInstancesList = async (params?: { patientId?: ID }) => {
  return axiosFetch
    .get<WorkflowInstance[]>(INSTANCES, { params })
    .then((r) => r.data);
};

// export const getInstancesAsync = async (search?:ID)=>{
//   const response = await axiosFetch({
//     method: 'GET',
//     url: EndpointEnum.PATIENTS,
//     params: search ? { search } : undefined,
//   });
//   return response.data;
// }
/**
 * create instance 
 * @param payload 
 * the backend receives data like 
 * {
  "id": "workflow-instance-example-01",
  "name": "Workflow Instance Example",
  "title": "Workflow Instance Example",
  "start_date": 1720000000,
  "current_step_id": "workflow-instance-step-example-01",
  "last_edited": 1720000000,
  "last_edited_by": 1243,
  "completion_date": 1720000000,
  "status": "Active",
  "workflow_template_id": "workflow-template-example-01",
  "patient_id": "patient-example-01",
  "steps": []
} 
 */
export const createInstance = async (payload: InstanceInput) => {
  return axiosFetch
    .post<WorkflowInstance>(INSTANCES, payload)
    .then((r) => r.data);
};
/**
 * get an instance detail by id
 * @param instanceId
 * @returns
 */
export const getInstanceById = async (instanceId: ID) => {
  return axiosFetch
    .get<WorkflowInstance>(instancePath(instanceId))
    .then((r) => r.data);
};

/**
 * update instance steps/instance form need to
 * @param instanceId
 * @param payload
 */
export const updateInstance = async (
  instanceId: ID,
  payload: InstanceUpdate
) => {
  axiosFetch
    .put<WorkflowInstance>(instancePath(instanceId), payload)
    .then((r) => r.data);
};

/**
 * archive workflow instance (soft delete)
 * @param instanceId
 * @returns
 */
export const archiveInstance = (instanceId: ID) =>
  axiosFetch
    .put<WorkflowInstance>(instancePath(instanceId), {
      status: 'Cancelled',
      lastUpdated: new Date().toISOString(),
    })
    .then((r) => r.data);

/**
 * unarchive workflow instance - recover
 * @param instanceId
 * @returns
 */
export const unArchiveInstance = (instanceId: ID) =>
  axiosFetch
    .put<WorkflowInstance>(instancePath(instanceId), {
      status: 'Active',
      lastUpdated: new Date().toISOString(),
    })
    .then((r) => r.data);

// /**
//  * Set archive status of a workflow instance
//  * @param instanceId
//  * @param archived
//  * @returns
//  */
// export const setArchiveStatus = (instanceId: ID, archived: boolean) =>
//   axiosFetch.put<WorkflowInstance>(instancePath(instanceId), {
//     archived,
//     lastUpdated: new Date().toISOString(),
//   }).then((r) => r.data);

/*
 * Steps inside an Instance
 *  */
export const listInstanceSteps = (instanceId: ID) => {
  return axiosFetch
    .get<WorkflowInstanceStep[]>(instanceStepsPath(instanceId))
    .then((r) => r.data);
};

/** PUT /workflow/instances/{id}/steps/{stepId} */
export const updateInstanceStep = (
  instanceId: ID,
  stepId: ID,
  payload: InstanceStepUpdate
) =>
  axiosFetch
    .put<WorkflowInstanceStep>(
      instanceStepByIdPath(instanceId, stepId),
      payload
    )
    .then((r) => r.data);

// GET /workflow/instances/{instanceId}?with_steps=true
export const getInstanceWithSteps = async (
  instanceId: ID
): Promise<WorkflowInstance> => {
  const response = await axiosFetch.get<WorkflowInstance>(
    `${instancePath(instanceId)}?with_steps=true`
  );
  return response.data;
};

// GET /workflow/instances?{patientId}&with_steps={withSteps}
export const getInstancesByPatient = async (
  patientId: ID,
  withSteps: boolean
): Promise<WorkflowInstance[]> => {
  const response = await axiosFetch.get<{ items: WorkflowInstance[] }>(
    `${INSTANCES}?${patientId}&with_steps=${withSteps}`
  );
  return response.data.items;
};

// GET /workflow/instances/by-template/{templateId}
export const getInstancesByTemplate = async (
  templateId: ID
): Promise<WorkflowInstance[]> => {
  const response = await axiosFetch.get<{ items: WorkflowInstance[] }>(
    `${INSTANCES}/by-template/${templateId}`
  );
  return response.data.items;
};

// DELETE /workflow/instances/{instanceId}
export const deleteInstance = (instanceId: ID) =>
  axiosFetch.delete(instancePath(instanceId));

// Instance Step APIs - align with backend workflow_instance_steps.py
const INSTANCE_STEPS = '/workflow/instance/steps';

// POST /workflow/instance/steps
export const createInstanceStep = (payload: WorkflowInstanceStep) =>
  axiosFetch
    .post<WorkflowInstanceStep>(INSTANCE_STEPS, payload)
    .then((r) => r.data);

// GET /workflow/instance/steps (with optional filtering)
export const getAllInstanceSteps = async (params?: {
  instance_id?: ID;
  user_id?: number;
}): Promise<WorkflowInstanceStep[]> => {
  const response = await axiosFetch.get<{ items: WorkflowInstanceStep[] }>(
    INSTANCE_STEPS,
    { params }
  );
  return response.data.items;
};

// GET /workflow/instance/steps/{stepId}
export const getInstanceStepById = async (
  stepId: ID
): Promise<WorkflowInstanceStep> => {
  const response = await axiosFetch.get<WorkflowInstanceStep>(
    `${INSTANCE_STEPS}/${stepId}`
  );
  return response.data;
};

// PATCH /workflow/instance/steps/{stepId}
export const updateInstanceStepById = (
  stepId: ID,
  payload: Partial<WorkflowInstanceStep>
) =>
  axiosFetch
    .patch<WorkflowInstanceStep>(`${INSTANCE_STEPS}/${stepId}`, payload)
    .then((r) => r.data);

// PUT /workflow/instance/steps/{stepId}/complete
export const completeInstanceStep = (stepId: ID) =>
  axiosFetch
    .put<WorkflowInstanceStep>(`${INSTANCE_STEPS}/${stepId}/complete`)
    .then((r) => r.data);

// DELETE /workflow/instance/steps/{stepId}
export const deleteInstanceStepById = (stepId: ID) =>
  axiosFetch.delete(`${INSTANCE_STEPS}/${stepId}`);
