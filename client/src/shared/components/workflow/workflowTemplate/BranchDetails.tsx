import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  Alert,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { BranchConditionEditor } from './BranchConditionEditor';
import {
  validateJsonLogic,
  stripRuleMetadata,
} from '../blocklyEditor/jsonLogicGenerator';
import { RuleEditorHelpDialog } from '../blocklyEditor/RuleEditorHelpDialog';
import { useWorkflowRuleClipboard } from 'src/shared/context/WorkflowRuleClipboardContext';
import { Toast } from 'src/shared/components/toast';

interface BranchDetailsProps {
  selectedStep?: WorkflowTemplateStepWithFormAndIndex;
  selectedBranchIndex?: number;
  steps: WorkflowTemplateStepWithFormAndIndex[];
  isEditMode?: boolean;
  onBranchChange?: (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string
  ) => void;
  onTargetStepChange?: (
    stepId: string,
    branchIndex: number,
    targetStepId: string
  ) => void;
  onClose: () => void;
}

export const BranchDetails: React.FC<BranchDetailsProps> = ({
  selectedStep,
  selectedBranchIndex,
  steps,
  onTargetStepChange,
  isEditMode = false,
  onBranchChange,
  onClose,
}) => {
  const branch = selectedStep?.branches?.[selectedBranchIndex || 0];
  const { copy } = useWorkflowRuleClipboard();

  //For Manual Saving
  const [localConditionRule, setLocalConditionRule] = useState<string>(
    branch?.condition?.rule || ''
  );
  const [localConditionName, setLocalConditionName] = useState<string>(
    branch?.condition?.rule
      ? (() => {
          try {
            return JSON.parse(branch.condition.rule).name || '';
          } catch {
            return '';
          }
        })()
      : ''
  );
  const [validationError, setValidationError] = useState<string | null>(() => {
    if (!branch?.condition?.rule) return null;
    try {
      return validateJsonLogic(
        stripRuleMetadata(JSON.parse(branch.condition.rule)),
        true
      )
        ? null
        : 'The condition is incomplete. All inputs must be connected before saving.';
    } catch {
      return 'Invalid condition rule.';
    }
  });
  const [newTargetStepId, setNewTargetStepId] = useState<string | undefined>(
    undefined
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [copyToastOpen, setCopyToastOpen] = useState(false);

  useEffect(() => {
    setLocalConditionRule(branch?.condition?.rule || '');
    setLocalConditionName(
      branch?.condition?.rule
        ? (() => {
            try {
              return JSON.parse(branch.condition.rule).name || '';
            } catch {
              return '';
            }
          })()
        : ''
    );
    setValidationError(
      branch?.condition?.rule
        ? validateJsonLogic(
            stripRuleMetadata(JSON.parse(branch.condition.rule)),
            true
          )
          ? null
          : 'The condition is incomplete. All inputs must be connected before saving.'
        : null
    );
    setNewTargetStepId(undefined);
  }, [branch, selectedBranchIndex]);

  const handleTargetStepChange = (
    stepId: string,
    branchIndex: number,
    targetStepId: string
  ) => {
    setNewTargetStepId(targetStepId); // Store locally, don't save yet
  };
  const handleBranchChange = (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string,
    validationError?: string | null
  ) => {
    setLocalConditionRule(conditionRule);
    setLocalConditionName(conditionName || '');
    if (validationError !== undefined) {
      setValidationError(validationError);
    } else if (conditionRule === '') {
      setValidationError(null);
    }
  };
  const handleCancel = () => {
    onClose();
  };
  const handleSave = () => {
    if (selectedStep && selectedBranchIndex !== undefined) {
      onBranchChange?.(
        selectedStep.id,
        selectedBranchIndex,
        localConditionRule,
        localConditionName
      );

      if (newTargetStepId) {
        onTargetStepChange?.(
          selectedStep.id,
          selectedBranchIndex,
          newTargetStepId
        );
      }
    }
    onClose();
  };

  const canCopyCondition =
    isEditMode && !!localConditionRule && !validationError;

  const handleCopyCondition = () => {
    if (!canCopyCondition || !selectedStep) return;

    const targetName =
      steps.find((s) => s.id === branch?.targetStepId)?.name || 'Unknown Step';
    const sourceLabel = `${selectedStep.name} → ${targetName}`;
    const ok = copy(localConditionRule, sourceLabel);
    if (ok) {
      setCopyToastOpen(true);
    }
  };

  if (!selectedStep || selectedBranchIndex === undefined) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Branch Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on a branch (+ button or condition) in the flow diagram to edit
          its conditions.
        </Typography>
      </Paper>
    );
  }

  if (!branch) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Branch Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Branch not found.
        </Typography>
      </Paper>
    );
  }

  const targetStep = steps.find((s) => s.id === branch.targetStepId);

  return (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        {isEditMode ? 'Edit Branch Condition' : 'View Branch Condition'}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          p: 2,
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1,
          }}>
          <Typography variant="body2" color="text.secondary">
            From: <strong>{selectedStep.name}</strong> → To:{' '}
            <strong>{targetStep?.name || 'Unknown Step'}</strong>
          </Typography>
          {isEditMode && (
            <IconButton
              size="small"
              aria-label="Rule editor help"
              onClick={() => setHelpOpen(true)}
              sx={{
                flexShrink: 0,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}>
              <HelpOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {isEditMode && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Tooltip
              title={
                canCopyCondition
                  ? 'Copy this condition to paste into another branch'
                  : 'Build a complete condition before copying'
              }>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyCondition}
                  disabled={!canCopyCondition}>
                  Copy condition
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}

        <BranchConditionEditor
          branch={branch}
          branchIndex={selectedBranchIndex}
          stepId={selectedStep.id}
          targetStepName={targetStep?.name}
          onTargetStepChange={handleTargetStepChange}
          isEditMode={isEditMode}
          isSelected={true}
          showFullEditor={true}
          editorFillHeight
          onChange={handleBranchChange}
          steps={steps}
        />
        {isEditMode && validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="primary">
          Cancel
        </Button>
        {isEditMode && (
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!!validationError || !localConditionRule}>
            Save
          </Button>
        )}
      </DialogActions>
      <RuleEditorHelpDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <Toast
        severity="success"
        message="Condition copied"
        open={copyToastOpen}
        onClose={() => setCopyToastOpen(false)}
      />
    </>
  );
};
