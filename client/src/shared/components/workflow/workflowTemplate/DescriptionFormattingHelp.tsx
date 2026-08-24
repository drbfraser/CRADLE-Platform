import { useState } from 'react';
import {
  IconButton,
  Popover,
  Typography,
  Box,
  Stack,
  Divider,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const MARKDOWN_EXAMPLES: { label: string; syntax: string }[] = [
  { label: 'Heading', syntax: '# Heading' },
  { label: 'Bold', syntax: '**bold**' },
  { label: 'Italic', syntax: '_italic_' },
  { label: 'Link', syntax: '[text](https://example.com)' },
  { label: 'Bullet list', syntax: '- item' },
  { label: 'Numbered list', syntax: '1. item' },
];

function SyntaxRow({ label, syntax }: { label: string; syntax: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="code"
        sx={{ fontFamily: 'monospace' }}>
        {syntax}
      </Typography>
    </Stack>
  );
}

export default function DescriptionFormattingHelp() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        size="small"
        aria-label="Description formatting help"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ p: 0.25 }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, maxWidth: 320 }}>
          <Typography variant="subtitle2" gutterBottom>
            Markdown formatting
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            {MARKDOWN_EXAMPLES.map((example) => (
              <SyntaxRow key={example.label} {...example} />
            ))}
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}>
            Use the calendar icon next to this one to insert a date relative to
            when the step starts. You can also type it directly, e.g.{' '}
            <Typography
              component="code"
              variant="caption"
              sx={{ fontFamily: 'monospace' }}>
              {'{{startDate+3d}}'}
            </Typography>{' '}
            for 3 days after the step starts.
          </Typography>

          <Typography variant="caption" color="text.secondary">
            You can also insert live patient/workflow data, e.g.{' '}
            <Typography
              component="code"
              variant="caption"
              sx={{ fontFamily: 'monospace' }}>
              {'{{patient.age}}'}
            </Typography>{' '}
            or{' '}
            <Typography
              component="code"
              variant="caption"
              sx={{ fontFamily: 'monospace' }}>
              {'{{pregnancies[latest].start_date}}'}
            </Typography>
            . These always show the current value, not a fixed snapshot.
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
