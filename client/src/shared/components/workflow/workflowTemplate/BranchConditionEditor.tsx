import React, { useState, useEffect } from 'react';
import { Box, Stack, TextField, Autocomplete, Typography } from '@mui/material';
import { WorkflowTemplateStepBranch } from 'src/shared/types/workflow/workflowApiTypes';

// Hardcoded condition options
const CONDITION_OPTIONS = [
  {
    field: "Patient's Age",
    value: 'patient.age',
    operators: [
      { label: 'Less than (<)', op: '<' },
      { label: 'Greater than (>)', op: '>' },
      { label: 'Equal to (=)', op: '==' },
      { label: 'Less than or equal (<=)', op: '<=' },
      { label: 'Greater than or equal (>=)', op: '>=' },
    ],
  },
];

/**
 * Temporary helper function to generate the JSON condition string
 * TODO: Replace with a more generic function that can handle all condition types
 */
const generateConditionJSON = (
  fieldValue: string,
  operator: string,
  value: number
): string => {
  const condition = {
    [operator]: [{ var: fieldValue }, value],
  };
  return JSON.stringify(condition);
};

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
  const [selectedField, setSelectedField] = useState<
    (typeof CONDITION_OPTIONS)[number] | null
  >(null);

  const [selectedOperator, setSelectedOperator] = useState<
    (typeof CONDITION_OPTIONS)[0]['operators'][number] | null
  >(null);

  const [selectedValue, setSelectedValue] = useState<string>('');

  // Generate and log JSON whenever inputs change
  useEffect(() => {
    if (selectedField && selectedOperator && selectedValue) {
      const conditionJSON = generateConditionJSON(
        selectedField.value,
        selectedOperator.op,
        Number(selectedValue)
      );
      console.log('Generated Condition JSON:', conditionJSON);
    }
  }, [selectedField, selectedOperator, selectedValue]);

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
            getOptionLabel={(option) => option.field}
            value={selectedField}
            onChange={(_, newValue) => {
              setSelectedField(newValue);
              setSelectedOperator(null);
              setSelectedValue('');
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
            options={selectedField?.operators || []}
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
            type="number"
            label="Enter a Value"
            placeholder="Enter value..."
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
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
