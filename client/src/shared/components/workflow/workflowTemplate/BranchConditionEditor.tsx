import React, { useState } from 'react';
import { Box, Stack, TextField, Autocomplete, Typography } from '@mui/material';
import { WorkflowTemplateStepBranch } from 'src/shared/types/workflow/workflowApiTypes';

// Hardcoded condition options
const CONDITION_OPTIONS = [
  {
    label: "Patient's Age",
    operators: [
      { label: 'Less than (<)', op: '<' },
      { label: 'Greater than (>)', op: '>' },
      { label: 'Equal to (=)', op: '==' },
      { label: 'Less than or equal (<=)', op: '<=' },
      { label: 'Greater than or equal (>=)', op: '>=' },
    ],
  },
];

interface BranchConditionEditorProps {
  branch: WorkflowTemplateStepBranch;
  branchIndex: number;
  stepId: string;
  targetStepName?: string;
  isEditMode?: boolean;
}

export const BranchConditionEditor: React.FC<BranchConditionEditorProps> = ({
  branch,
  branchIndex,
  stepId,
  targetStepName = 'Unknown Step',
  isEditMode = false,
}) => {
  // Track the selected field to show its operators
  const [selectedField, setSelectedField] = useState<
    (typeof CONDITION_OPTIONS)[0] | null
  >(null);

  const [selectedOperator, setSelectedOperator] = useState<
    (typeof CONDITION_OPTIONS)[0]['operators'][number] | null
  >(null);

  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Branch {branchIndex + 1} → {targetStepName}
      </Typography>

      {isEditMode ? (
        <Stack spacing={2}>
          <Autocomplete
            fullWidth
            size="small"
            options={CONDITION_OPTIONS}
            getOptionLabel={(option) => option.label}
            value={selectedField}
            onChange={(_, newValue) => {
              setSelectedField(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a Field"
                placeholder="Select field..."
              />
            )}
          />
          <Autocomplete
            fullWidth
            size="small"
            options={CONDITION_OPTIONS[0].operators}
            getOptionLabel={(option) => option.label}
            value={selectedOperator}
            onChange={(_, newValue) => {
              setSelectedOperator(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select an Operator"
                placeholder="Select operator..."
              />
            )}
          />
          <TextField
            fullWidth
            size="small"
            label="Enter a Value"
            placeholder="Enter value..."
            value={selectedValue}
            onChange={(e) => setSelectedValue(Number(e.target.value))}
          />
        </Stack>
      ) : (
        <>
          {branch.condition?.rule ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              Condition: {branch.condition.rule}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No condition set
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};
