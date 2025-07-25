//RULE GROUPS API

import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { ID } from '../../constants';
import { RuleGroup } from '../../types/workflow/workflowTypes';

const RULE_GROUPS = EndpointEnum.RULE_GROUPS;
const ruleGroupPath = (id: ID) => `${RULE_GROUPS}/${id}`;

// GET /rules/groups
export const listRuleGroups = async (): Promise<RuleGroup[]> => {
  const response = await axiosFetch.get<RuleGroup[]>(RULE_GROUPS);
  return response.data;
};
// GET /rules/groups/{groupId}
export const getRuleGroup = async (groupId: ID): Promise<RuleGroup> => {
  const response = await axiosFetch.get<RuleGroup>(ruleGroupPath(groupId));
  return response.data;
};

// POST /rules/groups - create group
export const createRuleGroup = async (payload: {
  logic: 'AND' | 'OR' | 'NOT';
  rules: string; // string blob
}): Promise<RuleGroup> => {
  const response = await axiosFetch.post<RuleGroup>(RULE_GROUPS, payload);
  return response.data;
};

// PUT /rules/groups/{groupId} - update
// export const updateRuleGroup = async (
//   groupId: ID,
//   payload: {
//     logic?: 'AND' | 'OR' | 'NOT';
//     rules?: string;
//   }
// ): Promise<RuleGroup> => {
//   const response = await axiosFetch.put<RuleGroup>(
//     ruleGroupPath(groupId),
//     payload
//   );
//   return response.data;
// };

// DELETE /rules/groups/{groupId}
export const deleteRuleGroupById = async (groupId: ID): Promise<void> => {
  await axiosFetch.delete<RuleGroup>(ruleGroupPath(groupId));
};

// POST /rules/groups/{groupId}/evaluate
export const evaluateRuleGroup = async (
  groupId: ID,
  context: Record<string, unknown>
): Promise<{ result: boolean; details?: Record<string, unknown> }> => {
  const response = await axiosFetch.post<{
    result: boolean;
    details?: Record<string, unknown>;
  }>(`${ruleGroupPath(groupId)}/evaluate`, { context });
  return response.data;
};
