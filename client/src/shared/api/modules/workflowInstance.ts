//workflow instance 
import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums'; 
import { ID } from '../../constants';
import {
  WorkflowInstance,
  InstanceInput,
  InstanceUpdate,
  InstanceStep,
  InstanceStepUpdate
} from '../../types/workflow/workflowTypes'

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
export const getInstancesList = async (params?:{patientId?:ID})=>{
  return axiosFetch.get<WorkflowInstance[]>(INSTANCES,{params})
  .then((r)=>r.data)
}

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
export const createInstance= async(payload:InstanceInput)=>{
  axiosFetch.post<WorkflowInstance>(INSTANCES,payload)
  .then((r)=>r.data)
}
/**
 * get an instance detail by id 
 * @param instanceId 
 * @returns 
 */
export const getInstanceById= async(instanceId: ID)=>{
  return axiosFetch.get<WorkflowInstance>(instancePath(instanceId)).then((r)=>r.data);
}

/**
 * update instance steps/instance form need to 
 * @param instanceId 
 * @param payload 
 */
export const updateInstance=async(instanceId:ID,payload:InstanceUpdate)=>{
  axiosFetch.put<WorkflowInstance>(instancePath(instanceId),payload).then((r)=>r.data);
}

/**
 * archive workflow instance (soft delete)
 * @param instanceId 
 * @returns 
 */
export const archiveInstance = (instanceId: ID) =>
  axiosFetch.put<WorkflowInstance>(instancePath(instanceId), {
    status: 'Cancelled',
    lastUpdated: new Date().toISOString(),
  }).then((r) => r.data);

/**
 * unarchive workflow instance - recover 
 * @param instanceId 
 * @returns 
 */
export const unArchiveInstance = (instanceId: ID) =>
  axiosFetch.put<WorkflowInstance>(instancePath(instanceId), {
    status: 'Active',
    lastUpdated: new Date().toISOString(),
  }).then((r) => r.data);  

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
export const listInstanceSteps = (instanceId: ID) =>{
  return axiosFetch
    .get<InstanceStep[]>(instanceStepsPath(instanceId))
    .then((r) => r.data)}

/** PUT /workflow/instances/{id}/steps/{stepId} */
export const updateInstanceStep = (
  instanceId: ID,
  stepId: ID,
  payload: InstanceStepUpdate,
) =>
  axiosFetch
    .put<InstanceStep>(instanceStepByIdPath(instanceId, stepId), payload)
    .then((r) => r.data);