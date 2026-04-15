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
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { BlocklyEditor } from '../blocklyEditor';

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
    conditionName?: string,
    validationError?: string | null
  ) => void;
  onTargetStepChange?: (
    stepId: string,
    branchIndex: number,
    targetStepId: string
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
  onTargetStepChange,
  steps = [],
}) => {
  const [conditionName, setConditionName] = useState<string>('');
  const [currentRule, setCurrentRule] = useState<string | null>(
    branch.condition?.rule || null
  );

  useEffect(() => {
    if (branch.condition?.rule) {
      try {
        const rule = JSON.parse(branch.condition.rule);
        setConditionName(rule.name || '');
      } catch {
        setConditionName('');
      }
      setCurrentRule(branch.condition.rule);
    } else {
      setConditionName('');
      setCurrentRule(null);
    }
  }, [branch, stepId, branchIndex]);

  const handleBlocklyChange = (
    jsonLogic: string | null,
    error: string | null
  ) => {
    setCurrentRule(jsonLogic);
    if (onChange) {
      onChange(stepId, branchIndex, jsonLogic ?? '', conditionName, error);
    }
  };

  const handleConditionNameChange = (name: string) => {
    setConditionName(name);
    if (currentRule && onChange) {
      onChange(stepId, branchIndex, currentRule, name);
    }
  };

  const initialJsonLogic = branch.condition?.rule || undefined;

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
                onChange={(e) => handleConditionNameChange(e.target.value)}
                helperText="This name will be displayed on the branch in the flow diagram"
              />
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <BlocklyEditor
            variables={[]}
            initialJsonLogic={initialJsonLogic}
            onChange={handleBlocklyChange}
          />

          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: 'text.black',
                  whiteSpace: 'nowrap',
                }}>
                then go to
              </Typography>
            </Grid>
            <Grid item xs>
              <Autocomplete
                fullWidth
                size="small"
                options={steps.filter((step) => step.id !== stepId)}
                getOptionLabel={(step) => step.name}
                value={steps.find((step) => step.id === branch.targetStepId)}
                onChange={(_, newStep) => {
                  if (newStep && onTargetStepChange) {
                    onTargetStepChange(stepId, branchIndex, newStep.id);
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
