import { useState } from 'react';
import {
  IconButton,
  Popover,
  Typography,
  Box,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Button,
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

const ANCHOR_OPTIONS = [
  { value: 'startDate', label: 'this step starts' },
  { value: 'today', label: 'someone views this (changes daily)' },
];

const UNIT_OPTIONS = [
  { value: 'd', label: 'day(s)' },
  { value: 'w', label: 'week(s)' },
  { value: 'm', label: 'month(s)' },
  { value: 'y', label: 'year(s)' },
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

type DescriptionFormattingHelpProps = {
  /** Called with the resolved `{{...}}` token to insert into the description. */
  onInsertDate?: (token: string) => void;
};

export default function DescriptionFormattingHelp({
  onInsertDate,
}: DescriptionFormattingHelpProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [amount, setAmount] = useState('3');
  const [unit, setUnit] = useState('d');
  const [anchor, setAnchor] = useState('startDate');

  const handleClose = () => setAnchorEl(null);

  const parsedAmount = Number(amount);
  const hasOffset = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const token = hasOffset
    ? `{{${anchor}+${parsedAmount}${unit}}}`
    : `{{${anchor}}}`;

  const handleInsert = () => {
    onInsertDate?.(token);
    handleClose();
  };

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
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Insert a date
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField
              type="number"
              size="small"
              label="Number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 90 }}
            />
            <TextField
              select
              size="small"
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              sx={{ flex: 1 }}>
              {UNIT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            select
            fullWidth
            size="small"
            label="After"
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            sx={{ mb: 1.5 }}>
            {ANCHOR_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleInsert}>
            Insert into description
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Markdown formatting
          </Typography>
          <Stack spacing={0.5}>
            {MARKDOWN_EXAMPLES.map((example) => (
              <SyntaxRow key={example.label} {...example} />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
