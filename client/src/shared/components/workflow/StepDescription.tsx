import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';
import { resolveDescriptionTemplate } from './descriptionTemplate';
import { resolveDescriptionVariables } from './descriptionVariables';
import useDescriptionVariables from 'src/shared/hooks/patient/useDescriptionVariables';
import { ID } from 'src/shared/constants';

type StepDescriptionProps = {
  description?: string | null;
  fallback?: string;
  /** Epoch seconds the step started, used to resolve `{{startDate...}}`. */
  startDate?: number;
  /**
   * Instance/step IDs, used to resolve rule-engine variable tokens like
   * `{{patient.age}}` against current data. Omit when there's no live
   * instance to resolve against (e.g. previewing a template) -- those
   * tokens render as an unresolved placeholder message instead, e.g.
   * `(patient age not loaded)`.
   */
  instanceId?: ID;
  stepId?: ID;
};

export default function StepDescription({
  description,
  fallback = 'No description available.',
  startDate,
  instanceId,
  stepId,
}: StepDescriptionProps) {
  const { resolutions } = useDescriptionVariables(
    instanceId,
    stepId,
    description
  );

  if (!description) {
    return (
      <Typography variant="body2" color="text.secondary">
        {fallback}
      </Typography>
    );
  }

  const withDateTokensResolved = resolveDescriptionTemplate(description, {
    startDate,
  });
  const withVariablesResolved = resolveDescriptionVariables(
    withDateTokensResolved,
    resolutions
  );

  return (
    <Typography variant="body2" color="text.secondary" component="div">
      <ReactMarkdown>{withVariablesResolved}</ReactMarkdown>
    </Typography>
  );
}
