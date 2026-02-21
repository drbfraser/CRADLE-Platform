import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
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
  isSelected?: boolean;
  showFullEditor?: boolean;
  onChange?: (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string
  ) => void;
  steps?: WorkflowTemplateStepWithFormAndIndex[];
}

export const BranchConditionEditor: React.FC<BranchConditionEditorProps> = ({
  branch,
  branchIndex,
  stepId,
  targetStepName = 'Unknown Step',
  isEditMode = false,
  isSelected = false,
  showFullEditor = false,
  onChange,
  steps =[],
}) => {
  const [conditionName, setConditionName] = useState<string>('');
  const [selectedField, setSelectedField] = useState<
    (typeof CONDITION_OPTIONS)[number] | null
  >(null);

  const [selectedOperator, setSelectedOperator] = useState<
    (typeof CONDITION_OPTIONS)[0]['operators'][number] | null
  >(null);

  const [selectedValue, setSelectedValue] = useState<string>('');

  // Initialize all fields from branch condition if it exists
  useEffect(() => {
    if (branch.condition?.rule) {
      try {
        const rule = JSON.parse(branch.condition.rule);

        // Restore condition name
        setConditionName(rule.name || '');

        // Find the operator and extract field and value
        const operators = ['<', '>', '==', '<=', '>='];
        let foundOperator = null;
        let foundField = null;
        let foundValue = '';

        for (const op of operators) {
          if (rule[op]) {
            foundOperator = op;
            // Rule structure: { "<": [{ "var": "patient.age" }, 18] }
            const [fieldObj, value] = rule[op];
            if (fieldObj?.var) {
              foundField = fieldObj.var;
              foundValue = String(value);
            }
            break;
          }
        }

        // Match found field to CONDITION_OPTIONS
        if (foundField) {
          const matchedOption = CONDITION_OPTIONS.find(
            (opt) => opt.value === foundField
          );
          if (matchedOption) {
            setSelectedField(matchedOption);

            // Match operator
            if (foundOperator) {
              const matchedOperator = matchedOption.operators.find(
                (opObj) => opObj.op === foundOperator
              );
              if (matchedOperator) {
                setSelectedOperator(matchedOperator);
              }
            }

            // Set value
            setSelectedValue(foundValue);
          }
        }
      } catch (error) {
        console.error('Failed to parse branch condition rule:', error);
        setConditionName('');
        setSelectedField(null);
        setSelectedOperator(null);
        setSelectedValue('');
      }
    } else {
      // Clear all fields if no condition exists
      setConditionName('');
      setSelectedField(null);
      setSelectedOperator(null);
      setSelectedValue('');
    }
  }, [branch, stepId, branchIndex]);

  // Generate and save condition JSON whenever inputs change
  // Note: We exclude onChange from dependencies to avoid unnecessary re-saves
  // when the callback reference changes
  useEffect(() => {
    if (selectedField && selectedOperator && selectedValue && onChange) {
      const conditionJSON = generateConditionJSON(
        selectedField.value,
        selectedOperator.op,
        Number(selectedValue)
      );

      onChange(stepId, branchIndex, conditionJSON, conditionName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedField,
    selectedOperator,
    selectedValue,
    conditionName,
    stepId,
    branchIndex,
  ]);

  return (
    <Box
      sx={{
        p: 2,
        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: isSelected
          ? 'rgba(25, 118, 210, 0.05)'
          : 'transparent',
        transition: 'all 0.2s ease-in-out',
        boxShadow: isSelected ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
      }}>
      {!showFullEditor && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Branch {branchIndex + 1} → {targetStepName}
        </Typography>
      )}

      {isEditMode ? (
      <Box>
        {showFullEditor && (
          <>
            <TextField
              fullWidth
              size="small"
              label="Condition Name"
              placeholder="Enter a name for this condition..."
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              helperText="This name will be displayed on the branch in the flow diagram"
            />
            <Divider sx={{ my: 2 }} />
          </>
        )}
        {/* Grid view (horizontal) */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={0.5} sm={0.5} md={0.5} lg={0.5} sx={{ ml: 3 }}>
            <Typography sx={{ fontWeight: 'bold', color: 'text.black', whiteSpace: 'nowrap', mt:1}}>
              if
            </Typography>
          </Grid>
          <Grid item xs={2.3} sm={2.3} md={2.3} lg={2.3}>
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
          </Grid>
          
          <Grid item xs={2.8} sm={2.8} md={2.8} lg={2.8}>
            <Autocomplete
              fullWidth
              size="small"
              options={CONDITION_OPTIONS[0].operators || []}
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
          </Grid>
          
          <Grid item xs={2} sm={2} md={2} lg={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Enter a Value"
              placeholder="Enter value..."
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={0.5} sm={0.5} md={0.5} lg={0.5}>
            <Typography sx={{ fontWeight: 'bold', color: 'text.black', whiteSpace: 'nowrap', mt:1}}>
              then go to
            </Typography>
          </Grid>

          <Grid item xs={2.5} sm={2.5} md={2.5} lg={2.5} sx={{ ml: 7 }}>
            <Autocomplete
              fullWidth
              size="small"
              options={steps.filter(step => step.id !== stepId)} //Don't add current step
              getOptionLabel={(step) => step.name}
              value={steps.find(step => step.id === branch.targetStepId) || null}
              onChange={(_, newStep) => {
                if (newStep) {
                  // Handle step change here
                }
              }}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Step"
                  placeholder="Select next step..."
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
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
