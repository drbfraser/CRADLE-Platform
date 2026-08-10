import { useMemo, useState } from 'react';
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
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';

import { getWorkflowVariables } from 'src/shared/api/modules/workflowVariables';

const UNIT_OPTIONS = [
  { value: 'd', label: 'day(s)' },
  { value: 'w', label: 'week(s)' },
  { value: 'm', label: 'month(s)' },
  { value: 'y', label: 'year(s)' },
];

// Namespaces whose backing data isn't actually wired up yet on the backend
// (see server's NOT_YET_IMPLEMENTED_NAMESPACES) -- don't offer these for
// insertion, since they'd always resolve to "not yet available".
const UNAVAILABLE_NAMESPACES = new Set(['referrals', 'assessments']);

// Friendly shortcuts for commonly-used variables, shown above the full
// searchable catalogue below. These always show the current ("floating")
// value, not a fixed snapshot.
const CURATED_ENTRIES: { label: string; description: string; tag: string }[] = [
  {
    label: 'Patient age',
    description: "Patient's current age in years",
    tag: 'patient.age',
  },
  {
    label: 'Allergies',
    description: "Patient's recorded allergies",
    tag: 'patient.allergy',
  },
  {
    label: 'Medications',
    description: "Patient's drug history",
    tag: 'patient.drug_history',
  },
];

// Pregnancy fields, shown in their own drill-down submenu (like "Readings")
// instead of as separate flat top-level entries.
const PREGNANCY_ENTRIES: { label: string; tag: string }[] = [
  { label: 'Start date', tag: 'pregnancies[latest].start_date' },
  { label: 'End date', tag: 'pregnancies[latest].end_date' },
  { label: 'Outcome', tag: 'pregnancies[latest].outcome' },
];

// Reading/vitals fields, shown in their own drill-down submenu (like
// "Relative date") rather than flattened into the top-level list, since
// there are enough of them to be their own category.
const READING_ENTRIES: { label: string; tag: string }[] = [
  { label: 'Systolic blood pressure', tag: 'vitals[latest].systolic_blood_pressure' },
  { label: 'Diastolic blood pressure', tag: 'vitals[latest].diastolic_blood_pressure' },
  { label: 'Heart rate', tag: 'vitals[latest].heart_rate' },
  { label: 'Date taken', tag: 'vitals[latest].date_taken' },
  { label: 'Flagged for follow-up', tag: 'vitals[latest].is_flagged_for_follow_up' },
  { label: 'Number of readings on file', tag: 'vitals.size' },
  { label: 'Urine test: leukocytes', tag: 'vitals[latest].urine_test.leukocytes' },
  { label: 'Urine test: nitrites', tag: 'vitals[latest].urine_test.nitrites' },
  { label: 'Urine test: glucose', tag: 'vitals[latest].urine_test.glucose' },
  { label: 'Urine test: protein', tag: 'vitals[latest].urine_test.protein' },
  { label: 'Urine test: blood', tag: 'vitals[latest].urine_test.blood' },
];

type DescriptionInsertPickerProps = {
  /** Called with the token (e.g. `{{startDate+3d}}` or `{{patient.age}}`) to insert. */
  onInsertToken?: (token: string) => void;
};

type PickerView = 'menu' | 'date' | 'readings' | 'pregnancy';

export default function DescriptionInsertPicker({
  onInsertToken,
}: DescriptionInsertPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<PickerView>('menu');
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('3');
  const [unit, setUnit] = useState('d');

  const variablesQuery = useQuery({
    queryKey: ['workflowVariables'],
    queryFn: () => getWorkflowVariables(),
  });

  const curatedTags = useMemo(
    () =>
      new Set([
        ...CURATED_ENTRIES.map((e) => e.tag),
        ...PREGNANCY_ENTRIES.map((e) => e.tag),
        ...READING_ENTRIES.map((e) => e.tag),
      ]),
    []
  );

  const filteredCuratedEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CURATED_ENTRIES;
    return CURATED_ENTRIES.filter(
      (e) =>
        e.label.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tag.toLowerCase().includes(query)
    );
  }, [search]);

  const availableVariables = useMemo(() => {
    const variables = variablesQuery.data ?? [];
    return variables.filter(
      (v) =>
        (!v.namespace || !UNAVAILABLE_NAMESPACES.has(v.namespace)) &&
        !curatedTags.has(v.tag)
    );
  }, [variablesQuery.data, curatedTags]);

  const filteredVariables = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableVariables;
    return availableVariables.filter(
      (v) =>
        v.tag.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
    );
  }, [availableVariables, search]);

  const handleClose = () => {
    setAnchorEl(null);
    setView('menu');
    setSearch('');
  };

  const insertAndClose = (token: string) => {
    onInsertToken?.(token);
    handleClose();
  };

  const parsedAmount = Number(amount);
  const hasOffset = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const dateToken = hasOffset
    ? `{{startDate+${parsedAmount}${unit}}}`
    : '{{startDate}}';

  return (
    <>
      <Tooltip title="Insert a date or patient/workflow data">
        <IconButton
          size="small"
          aria-label="Insert data into description"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0.25 }}>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        {view === 'menu' ? (
          <Box sx={{ width: 300 }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Insert into description
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search patient/workflow data..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
              <ListItemButton onClick={() => setView('date')}>
                <ListItemText
                  primary="Relative date"
                  secondary="e.g. 3 days after this step starts"
                />
              </ListItemButton>
              <ListItemButton onClick={() => setView('readings')}>
                <ListItemText
                  primary="Readings"
                  secondary="Blood pressure, heart rate, urine test, etc."
                />
              </ListItemButton>
              <ListItemButton onClick={() => setView('pregnancy')}>
                <ListItemText
                  primary="Pregnancy"
                  secondary="Start date, end date, outcome"
                />
              </ListItemButton>
              {filteredCuratedEntries.map((entry) => (
                <ListItemButton
                  key={entry.tag}
                  onClick={() => insertAndClose(`{{${entry.tag}}}`)}>
                  <ListItemText
                    primary={entry.label}
                    secondary={entry.description}
                  />
                </ListItemButton>
              ))}

              <Divider sx={{ my: 0.5 }} />

              {variablesQuery.isLoading && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Loading available data...
                  </Typography>
                </Box>
              )}
              {filteredVariables.map((v) => (
                <ListItemButton
                  key={v.tag}
                  onClick={() => insertAndClose(`{{${v.tag}}}`)}>
                  <ListItemText
                    primary={v.tag}
                    secondary={v.description}
                    slotProps={{
                      primary: { sx: { fontFamily: 'monospace' } },
                    }}
                  />
                </ListItemButton>
              ))}
              {!variablesQuery.isLoading &&
                filteredVariables.length === 0 &&
                filteredCuratedEntries.length === 0 && (
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      No matching data found.
                    </Typography>
                  </Box>
                )}
            </List>
          </Box>
        ) : view === 'date' ? (
          <Box sx={{ p: 2, width: 280 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
              <IconButton
                size="small"
                aria-label="Back"
                onClick={() => setView('menu')}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2">Insert a date</Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1.5, display: 'block' }}>
              Date will be relative to when this step is created.
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
              onClick={() => insertAndClose(dateToken)}>
              Insert into description
            </Button>
          </Box>
        ) : view === 'readings' ? (
          <Box sx={{ width: 280 }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  aria-label="Back"
                  onClick={() => setView('menu')}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2">Readings</Typography>
              </Stack>
            </Box>
            <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
              {READING_ENTRIES.map((entry) => (
                <ListItemButton
                  key={entry.tag}
                  onClick={() => insertAndClose(`{{${entry.tag}}}`)}>
                  <ListItemText primary={entry.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ width: 280 }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  aria-label="Back"
                  onClick={() => setView('menu')}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2">Pregnancy</Typography>
              </Stack>
            </Box>
            <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
              {PREGNANCY_ENTRIES.map((entry) => (
                <ListItemButton
                  key={entry.tag}
                  onClick={() => insertAndClose(`{{${entry.tag}}}`)}>
                  <ListItemText primary={entry.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </Popover>
    </>
  );
}
