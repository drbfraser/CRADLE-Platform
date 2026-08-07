import { useQuery } from '@tanstack/react-query';
import { getStepDescriptionVariables } from 'src/shared/api/modules/workflowInstance';
import { extractVariableTags } from 'src/shared/components/workflow/descriptionVariables';
import { ID } from 'src/shared/constants';

/**
 * Fetches current ("floating") values for the rule-engine variable tags
 * referenced in a step description, e.g. `{{patient.age}}`. Returns an empty
 * list of resolutions when there's nothing to resolve (no description, no
 * instance/step context yet -- e.g. previewing a template) rather than
 * calling the API with an empty tag list.
 */
export default function useDescriptionVariables(
  instanceId: ID | undefined,
  stepId: ID | undefined,
  description: string | null | undefined
) {
  const variableTags = description ? extractVariableTags(description) : [];

  const { data, isLoading } = useQuery({
    queryKey: ['descriptionVariables', instanceId, stepId, variableTags],
    queryFn: () =>
      getStepDescriptionVariables(instanceId!, stepId!, variableTags),
    enabled: Boolean(instanceId) && Boolean(stepId) && variableTags.length > 0,
  });

  return { resolutions: data ?? [], isLoading };
}
