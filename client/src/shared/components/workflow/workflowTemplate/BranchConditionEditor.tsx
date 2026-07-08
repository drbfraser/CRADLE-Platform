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
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { BlocklyEditor } from '../blocklyEditor';
import {
  WorkflowVariable,
  getWorkflowVariables,
  getFormTemplateAsyncV2,
} from 'src/shared/api';
import { QuestionTypeEnum } from 'src/shared/enums';

const QUESTION_TYPE_TO_VAR_TYPE: Partial<
  Record<QuestionTypeEnum, WorkflowVariable['type']>
> = {
  [QuestionTypeEnum.INTEGER]: 'integer',
  [QuestionTypeEnum.DECIMAL]: 'double',
  [QuestionTypeEnum.STRING]: 'string',
  [QuestionTypeEnum.MULTIPLE_CHOICE]: 'string',
  [QuestionTypeEnum.DATE]: 'date',
  [QuestionTypeEnum.DATETIME]: 'date',
};

function questionToWorkflowVariable(q: TQuestion): WorkflowVariable {
  const englishText =
    q.questionText['English'] ?? Object.values(q.questionText)[0] ?? '';
  return {
    tag: `forms[latest].${q.userQuestionId}`,
    description: englishText,
    type: QUESTION_TYPE_TO_VAR_TYPE[q.questionType]!,
    namespace: 'forms',
    collectionName: 'forms',
    isComputed: false,
    isDynamic: true,
  };
}

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
  const [variables, setVariables] = useState<WorkflowVariable[]>([]);
  const [variablesLoading, setVariablesLoading] = useState(true);
  const [conditionName, setConditionName] = useState<string>('');
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
      const globalVars = await getWorkflowVariables();
      let formVars: WorkflowVariable[] = [];
      if (formId) {
        try {
          const template = await getFormTemplateAsyncV2(formId);
          formVars = template.questions
            .filter(
              (q) =>
                q.userQuestionId && q.questionType in QUESTION_TYPE_TO_VAR_TYPE
            )
            .map(questionToWorkflowVariable);
        } catch {
          // form fetch failure is non-fatal; branch editor still works with global vars
        }
      }
      if (!cancelled) {
        setVariables([...globalVars, ...formVars]);
        setVariablesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [formId, stepId]);

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
    setConditionName(name);
    if (onChange) {
      onChange(
        stepId,
        branchIndex,
        currentRuleRef.current ?? branch.condition?.rule ?? '',
        name
      );
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

          {variablesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <BlocklyEditor
              key={`${stepId}-${branchIndex}`}
              variables={variables}
              initialJsonLogic={initialJsonLogic}
              onChange={handleBlocklyChange}
            />
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
