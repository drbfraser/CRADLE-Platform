import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';
import { resolveDescriptionTemplate } from './descriptionTemplate';

type StepDescriptionProps = {
  description?: string | null;
  fallback?: string;
  /** Epoch seconds the step started, used to resolve `{{startDate...}}`. */
  startDate?: number;
};

export default function StepDescription({
  description,
  fallback = 'No description available.',
  startDate,
}: StepDescriptionProps) {
  if (!description) {
    return (
      <Typography variant="body2" color="text.secondary">
        {fallback}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary" component="div">
      <ReactMarkdown>
        {resolveDescriptionTemplate(description, { startDate })}
      </ReactMarkdown>
    </Typography>
  );
}
