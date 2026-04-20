import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';

export interface WorkflowVariable {
  tag: string;
  description?: string;
  type: 'integer' | 'double' | 'string' | 'date' | 'boolean' | 'collection';
  namespace?: string;
  collectionName?: string;
  fieldPath?: string[];
  isComputed: boolean;
  isDynamic: boolean;
}

export const getWorkflowVariables = async (params?: {
  namespace?: string;
  type?: string;
  collection?: string;
}): Promise<WorkflowVariable[]> => {
  const response = await axiosFetch.get<{ variables: WorkflowVariable[] }>(
    EndpointEnum.WORKFLOW_VARIABLES,
    { params }
  );
  return response.data.variables;
};
