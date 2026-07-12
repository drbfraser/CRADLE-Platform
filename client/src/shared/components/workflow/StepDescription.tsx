import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';
import { resolveDescriptionTemplate } from './descriptionTemplate';

type StepDescriptionProps = {
  description?: string | null;
  fallback?: string;
};

export default function StepDescription({
  description,
  fallback = 'No description available.',
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
      <ReactMarkdown>{resolveDescriptionTemplate(description)}</ReactMarkdown>
    </Typography>
  );
}
