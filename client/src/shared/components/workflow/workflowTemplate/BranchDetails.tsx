import React, { useState, useEffect, useRef } from 'react';
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
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { BranchConditionEditor } from './BranchConditionEditor';
import {
  validateJsonLogic,
  stripRuleMetadata,
} from '../blocklyEditor/jsonLogicGenerator';
import { validateRuleForPaste } from '../blocklyEditor/validateRuleForPaste';
import { RuleEditorHelpDialog } from '../blocklyEditor/RuleEditorHelpDialog';
import { useWorkflowRuleClipboard } from 'src/shared/context/WorkflowRuleClipboardContext';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { Toast } from 'src/shared/components/toast';
import { WorkflowVariable } from 'src/shared/api';
import { getStepWorkflowVariables } from 'src/shared/utils/workflow/getStepWorkflowVariables';
import { suggestPastedConditionName } from 'src/shared/utils/workflow/suggestPastedConditionName';

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

type FeedbackToast = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

const CLOSED_TOAST: FeedbackToast = {
  open: false,
  message: '',
  severity: 'success',
};

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
  const { copy, peek, hasCopiedRule, copiedRule } = useWorkflowRuleClipboard();

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
  const [feedbackToast, setFeedbackToast] =
    useState<FeedbackToast>(CLOSED_TOAST);
  const [editorReloadKey, setEditorReloadKey] = useState(0);
  const [pasteWarning, setPasteWarning] = useState<string[] | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingPasteRule, setPendingPasteRule] = useState<string | null>(null);
  const [availableVariables, setAvailableVariables] = useState<
    WorkflowVariable[]
  >([]);
  // Skip clearing paste warning on the first Blockly onChange after paste remount.
  const skipPasteWarningClearRef = useRef(false);

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
    setPasteWarning(null);
    setEditorReloadKey(0);
    setReplaceConfirmOpen(false);
    setPendingPasteRule(null);
  }, [branch, selectedBranchIndex]);

  useEffect(() => {
    if (!selectedStep) {
      setAvailableVariables([]);
      return;
    }

    let cancelled = false;
    getStepWorkflowVariables({ formId: selectedStep.formId }).then((vars) => {
      if (!cancelled) {
        setAvailableVariables(vars);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedStep?.id, selectedStep?.formId]);

  const showToast = (
    message: string,
    severity: FeedbackToast['severity'] = 'success'
  ) => {
    setFeedbackToast({ open: true, message, severity });
  };

  const handleTargetStepChange = (
    stepId: string,
    branchIndex: number,
    targetStepId: string
  ) => {
    setNewTargetStepId(targetStepId);
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
    if (skipPasteWarningClearRef.current) {
      skipPasteWarningClearRef.current = false;
    } else if (pasteWarning) {
      setPasteWarning(null);
    }
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
      showToast('Condition copied');
    } else {
      showToast('Could not copy condition', 'error');
    }
  };

  const applyPaste = (
    rule: string,
    missingVariables: string[],
    sourceLabel: string
  ) => {
    skipPasteWarningClearRef.current = true;
    setLocalConditionRule(rule);
    setLocalConditionName(suggestPastedConditionName(sourceLabel));
    setValidationError(null);
    setPasteWarning(missingVariables.length > 0 ? missingVariables : null);
    setEditorReloadKey((key) => key + 1);
    showToast(
      missingVariables.length > 0
        ? 'Condition pasted — some variables may be missing on this step'
        : 'Condition pasted',
      missingVariables.length > 0 ? 'warning' : 'success'
    );
    setReplaceConfirmOpen(false);
    setPendingPasteRule(null);
  };

  const handlePasteCondition = () => {
    const copied = peek();
    if (!copied) return;

    const validation = validateRuleForPaste({
      rule: copied.rule,
      availableVariables,
    });
    if (!validation.ok) {
      showToast(validation.reason || 'Could not paste condition', 'error');
      return;
    }

    const hasExistingCondition = !!localConditionRule.trim();
    if (hasExistingCondition) {
      setPendingPasteRule(copied.rule);
      setReplaceConfirmOpen(true);
      return;
    }

    applyPaste(copied.rule, validation.missingVariables, copied.sourceLabel);
  };

  const handleConfirmReplace = () => {
    const copied = peek();
    if (!pendingPasteRule || !copied) {
      setReplaceConfirmOpen(false);
      setPendingPasteRule(null);
      return;
    }

    const validation = validateRuleForPaste({
      rule: pendingPasteRule,
      availableVariables,
    });
    if (!validation.ok) {
      setReplaceConfirmOpen(false);
      setPendingPasteRule(null);
      showToast(validation.reason || 'Could not paste condition', 'error');
      return;
    }

    applyPaste(
      pendingPasteRule,
      validation.missingVariables,
      copied.sourceLabel
    );
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
  const pasteTooltip = hasCopiedRule
    ? `Paste condition from ${copiedRule?.sourceLabel ?? 'clipboard'}`
    : 'Copy a condition from another branch first';

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
            <Tooltip title={pasteTooltip}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentPasteIcon />}
                  onClick={handlePasteCondition}
                  disabled={!hasCopiedRule}>
                  Paste condition
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}

        {isEditMode && pasteWarning && pasteWarning.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            onClose={() => setPasteWarning(null)}>
            Some variables in this condition are not available on this step:{' '}
            {pasteWarning.join(', ')}. You can still edit or remove them before
            saving.
          </Alert>
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
          editorJsonLogic={localConditionRule}
          editorReloadKey={editorReloadKey}
          conditionName={localConditionName}
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
      <ConfirmDialog
        title="Replace existing condition?"
        content="This branch already has a condition. Pasting will replace it."
        open={replaceConfirmOpen}
        onClose={() => {
          setReplaceConfirmOpen(false);
          setPendingPasteRule(null);
        }}
        onConfirm={handleConfirmReplace}
      />
      <Toast
        severity={feedbackToast.severity}
        message={feedbackToast.message}
        open={feedbackToast.open}
        onClose={() => setFeedbackToast(CLOSED_TOAST)}
      />
    </>
  );
};
