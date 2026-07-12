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

const START_DATE_EXAMPLES: { label: string; syntax: string }[] = [
  { label: 'When the step started', syntax: '{{startDate}}' },
  { label: '3 days after step started', syntax: '{{startDate+3d}}' },
  { label: '2 weeks after step started', syntax: '{{startDate+2w}}' },
];

const TODAY_EXAMPLES: { label: string; syntax: string }[] = [
  { label: "Today's date", syntax: '{{today}}' },
  { label: '3 days from today', syntax: '{{today+3d}}' },
  { label: '2 weeks ago', syntax: '{{today-2w}}' },
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

          <Typography variant="subtitle2" gutterBottom>
            Computed dates — relative to step start (recommended)
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            {START_DATE_EXAMPLES.map((example) => (
              <SyntaxRow key={example.label} {...example} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Stays fixed once the step starts, no matter when it's viewed.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="subtitle2" gutterBottom>
            Computed dates — relative to today
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            {TODAY_EXAMPLES.map((example) => (
              <SyntaxRow key={example.label} {...example} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Recalculated every time the description is viewed — the date
            shown will shift if viewed on a later day. Units: d = days, w =
            weeks, m = months, y = years.
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
