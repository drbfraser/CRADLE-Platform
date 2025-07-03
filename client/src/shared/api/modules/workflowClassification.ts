import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';
import { ID } from '../../constants';
import {
  ClassificationInput,
  WorkflowClassification,
} from '../../types/workflow/workflowTypes';

// full path
const CLASSIFICATIONS = EndpointEnum.WORKFLOW_CLASSIFICATIONS;

// specific classification path
const classificationPath = (id: ID) => `${CLASSIFICATIONS}/${id}`;

// GET /workflow/classifications
export const listWorkflowClassifications = async (): Promise<
  WorkflowClassification[]
> => {
  const response = await axiosFetch.get<WorkflowClassification[]>(
    CLASSIFICATIONS
  );
  return response.data;
};

// GET /workflow/classifications/{classificationId}
export const getWorkflowClassification = async (
  classificationId: ID
): Promise<WorkflowClassification> => {
  const response = await axiosFetch.get<WorkflowClassification>(
    classificationPath(classificationId)
  );
  return response.data;
};

// POST /workflow/classifications
export const createClassification = (payload: ClassificationInput) =>
  axiosFetch
    .post<WorkflowClassification>(CLASSIFICATIONS, payload)
    .then((r) => r.data);

// PUT /workflow/classifications
export const updateClassification = (
  classificationId: ID,
  payload: ClassificationInput
) =>
  axiosFetch
    .put<WorkflowClassification>(classificationPath(classificationId), payload)
    .then((r) => r.data);
