import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import { WorkflowTemplateStepBranch } from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { BlocklyEditor } from '../blocklyEditor';
import { WorkflowVariable } from 'src/shared/api';
import { getStepWorkflowVariables } from 'src/shared/utils/workflow/getStepWorkflowVariables';

interface BranchConditionEditorProps {
  branch: WorkflowTemplateStepBranch;
  branchIndex: number;
  stepId: string;
  targetStepName?: string;
  isEditMode?: boolean;
  isSelected?: boolean;
  showFullEditor?: boolean;
  editorFillHeight?: boolean;
  /** Rule shown in Blockly; parent is source of truth when set. */
  editorJsonLogic?: string;
  /** Bump to remount Blockly after paste. */
  editorReloadKey?: number;
  /** Controlled condition name (branch dialog). */
  conditionName?: string;
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
  editorFillHeight = false,
  editorJsonLogic,
  editorReloadKey = 0,
  conditionName: controlledConditionName,
  onChange,
  onTargetStepChange,
  steps = [],
}) => {
  const [variables, setVariables] = useState<WorkflowVariable[]>([]);
  const [variablesLoading, setVariablesLoading] = useState(true);
  const [internalConditionName, setInternalConditionName] = useState<string>('');
  const conditionName =
    controlledConditionName !== undefined
      ? controlledConditionName
      : internalConditionName;
  const [currentRule, setCurrentRule] = useState<string | null>(
    branch.condition?.rule || null
  );
  // BlocklyEditor registers onChange once on mount, so handleBlocklyChange
  // must read the latest name via a ref to avoid stale closure wiping the name.
  const conditionNameRef = useRef(conditionName);
  const currentRuleRef = useRef(currentRule);

  useEffect(() => {
    conditionNameRef.current = conditionName;
  }, [conditionName]);

  useEffect(() => {
    currentRuleRef.current = currentRule;
  }, [currentRule]);

  const currentStep = steps?.find((s) => s.id === stepId);
  const formId = currentStep?.formId;

  useEffect(() => {
    let cancelled = false;
    setVariablesLoading(true);

    const load = async () => {
      const vars = await getStepWorkflowVariables({ formId });
      if (!cancelled) {
        setVariables(vars);
        setVariablesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [formId, stepId]);

  useEffect(() => {
    if (editorJsonLogic !== undefined) {
      setCurrentRule(editorJsonLogic || null);
    }
  }, [editorJsonLogic, editorReloadKey]);

  useEffect(() => {
    if (controlledConditionName === undefined) {
      if (branch.condition?.rule) {
        try {
          const rule = JSON.parse(branch.condition.rule);
          setInternalConditionName(rule.name || '');
        } catch {
          setInternalConditionName('');
        }
      } else {
        setInternalConditionName('');
      }
    }
    if (editorJsonLogic === undefined) {
      setCurrentRule(branch.condition?.rule || null);
    }
  }, [branch, stepId, branchIndex, controlledConditionName, editorJsonLogic]);

  const handleBlocklyChange = (
    jsonLogic: string | null,
    error: string | null
  ) => {
    setCurrentRule(jsonLogic);
    if (onChange) {
      onChange(
        stepId,
        branchIndex,
        jsonLogic ?? '',
        conditionNameRef.current,
        error
      );
    }
  };

  const handleConditionNameChange = (name: string) => {
    if (controlledConditionName === undefined) {
      setInternalConditionName(name);
    }
    if (onChange) {
      onChange(
        stepId,
        branchIndex,
        currentRuleRef.current ?? editorJsonLogic ?? branch.condition?.rule ?? '',
        name
      );
    }
  };

  const initialJsonLogic =
    editorJsonLogic !== undefined
      ? editorJsonLogic || undefined
      : branch.condition?.rule || undefined;

  return (
    <Box
      sx={{
        p: showFullEditor ? 0 : 2,
        border: showFullEditor
          ? 'none'
          : isSelected
            ? '2px solid #1976d2'
            : '1px solid #e0e0e0',
        borderRadius: showFullEditor ? 0 : 1,
        backgroundColor: showFullEditor
          ? 'transparent'
          : isSelected
            ? 'rgba(25, 118, 210, 0.05)'
            : 'transparent',
        transition: showFullEditor ? 'none' : 'all 0.2s ease-in-out',
        boxShadow: showFullEditor
          ? 'none'
          : isSelected
            ? '0 2px 8px rgba(25, 118, 210, 0.2)'
            : 'none',
        display: editorFillHeight ? 'flex' : 'block',
        flexDirection: editorFillHeight ? 'column' : undefined,
        flex: editorFillHeight ? 1 : undefined,
        minHeight: editorFillHeight ? 0 : undefined,
      }}>
      {!showFullEditor && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Branch {branchIndex + 1} → {targetStepName}
        </Typography>
      )}

      {isEditMode ? (
        <Box
          sx={{
            display: editorFillHeight ? 'flex' : 'block',
            flexDirection: editorFillHeight ? 'column' : undefined,
            flex: editorFillHeight ? 1 : undefined,
            minHeight: editorFillHeight ? 0 : undefined,
          }}>
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

          {variablesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box
              sx={{
                flex: editorFillHeight ? 1 : undefined,
                minHeight: editorFillHeight ? 200 : undefined,
                display: editorFillHeight ? 'flex' : 'block',
                flexDirection: editorFillHeight ? 'column' : undefined,
              }}>
              <BlocklyEditor
                key={`${stepId}-${branchIndex}-${editorReloadKey}`}
                variables={variables}
                initialJsonLogic={initialJsonLogic}
                onChange={handleBlocklyChange}
                fillHeight={editorFillHeight}
              />
            </Box>
          )}

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
