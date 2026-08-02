import { useState } from 'react';
import {
  IconButton,
  Popover,
  Typography,
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Tooltip,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const UNIT_OPTIONS = [
  { value: 'd', label: 'day(s)' },
  { value: 'w', label: 'week(s)' },
  { value: 'm', label: 'month(s)' },
  { value: 'y', label: 'year(s)' },
];

type DescriptionDateInsertPickerProps = {
  /** Called with the resolved `{{startDate...}}` token to insert into the description. */
  onInsertDate?: (token: string) => void;
};

export default function DescriptionDateInsertPicker({
  onInsertDate,
}: DescriptionDateInsertPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [amount, setAmount] = useState('3');
  const [unit, setUnit] = useState('d');

  const handleClose = () => setAnchorEl(null);

  const parsedAmount = Number(amount);
  const hasOffset = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const token = hasOffset
    ? `{{startDate+${parsedAmount}${unit}}}`
    : '{{startDate}}';

  const handleInsert = () => {
    onInsertDate?.(token);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Insert a date relative to when this step starts">
        <IconButton
          size="small"
          aria-label="Insert a date"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0.25 }}>
          <CalendarMonthIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" gutterBottom>
            Insert a date
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1.5, display: 'block' }}>
            Date will be realtive to when this step is created.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
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
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleInsert}>
            Insert into description
          </Button>
        </Box>
      </Popover>
    </>
  );
}
