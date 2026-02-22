import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Button,
  Dialog,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { ID } from 'src/shared/constants';
import { WorkflowFlow } from './WorkflowFlow';
import { StepDetails } from './StepDetails';
import { BranchDetails } from './BranchDetails';

interface WorkflowFlowViewProps {
  steps: WorkflowTemplateStepWithFormAndIndex[];
  firstStepId: ID;
  isInstance?: boolean;
  isEditMode?: boolean;
  selectedStepId?: string;
  selectedBranchIndex?: number;
  onStepChange?: (stepId: string, field: string, value: string) => void;
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
  onStepSelect?: (stepId: string) => void;
  onInsertNode?: (stepId: string) => void;
  onAddBranch?: (stepId: string) => void;
  onConnectionCreate?: (sourceStepId: string, targetStepId: string) => void;
  onDeleteNode?: (stepId: string) => void;
  onEditBranch?: (stepId: string, branchIndex: number) => void;
  setSelectedStepId?: (stepId: string | undefined) => void;
  setSelectedBranchIndex?: (index: number | undefined) => void;
  onAddRule?: (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => void;
  // props for undo redo
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const WorkflowFlowView: React.FC<WorkflowFlowViewProps> = ({
  steps,
  firstStepId,
  isInstance = false,
  isEditMode = false,
  selectedStepId: controlledSelectedStepId,
  selectedBranchIndex,
  onStepChange,
  onBranchChange,
  onTargetStepChange,
  onStepSelect,
  onInsertNode,
  onAddBranch,
  onConnectionCreate,
  onDeleteNode,
  onAddRule,
  onEditBranch,
  setSelectedStepId,
  setSelectedBranchIndex,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [internalSelectedStepId, setInternalSelectedStepId] = useState<
    string | undefined
  >(controlledSelectedStepId);

  // Use controlled prop if provided, otherwise use internal state
  const selectedStepId =
    controlledSelectedStepId !== undefined
      ? controlledSelectedStepId
      : internalSelectedStepId;

  const branchIndex = selectedBranchIndex;
  const selectedStep = useMemo(() => {
    if (!selectedStepId) return undefined;
    return steps.find((step) => step.id === selectedStepId);
  }, [selectedStepId, steps]);

  const handleStepSelect = (stepId: string) => {
    if (onStepSelect) {
      onStepSelect(stepId);
    } else {
      setInternalSelectedStepId(stepId);
    }
  };

  const handleAddBranch = (stepId: string) => {
    // Set the step ID to identify which step we're adding a branch to
    if (setSelectedStepId) {
      setSelectedStepId(stepId);
    } else {
      setInternalSelectedStepId(stepId);
    }

    // Set branch index to 0 for new branches
    if (setSelectedBranchIndex) {
      setSelectedBranchIndex(0);
    }

    // Create new branch
    if (onAddBranch) {
      onAddBranch(stepId);
    }
  };

  const handleCloseBranchEditor = () => {
    if (setSelectedBranchIndex) {
      setSelectedBranchIndex(undefined);
    }
    //clear step selection
    if (setSelectedStepId) {
      setSelectedStepId(undefined);
    }
  };

  return (
    <Box sx={{ height: '600px', width: '100%', overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Left side - Flow Diagram */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper
            sx={{
              height: '100%',
              p: 1,
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}>
            {/* <Typography variant="h6" sx={{ mb: 2, px: 2 }}>
              Workflow Flow Diagram
            </Typography> */}
            {isEditMode && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Undo the last action" placement="top">
                  <span>
                    <Button
                      onClick={onUndo}
                      disabled={!canUndo}
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<UndoIcon />}>
                      Undo
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Redo the last action" placement="top">
                  <span>
                    <Button
                      onClick={onRedo}
                      disabled={!canRedo}
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<RedoIcon />}>
                      Redo
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            )}

            <Box sx={{ height: 'calc(100% - 60px)', overflow: 'hidden' }}>
              <WorkflowFlow
                steps={steps}
                firstStepId={firstStepId}
                selectedStepId={selectedStepId}
                isEditMode={isEditMode}
                onStepSelect={handleStepSelect}
                onInsertNode={onInsertNode}
                onAddBranch={handleAddBranch}
                onConnectionCreate={onConnectionCreate}
                onDeleteNode={onDeleteNode}
                onAddRule={onAddRule}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Step Details or Branch Details */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Box
            sx={{
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
            }}>
            <StepDetails
              selectedStep={selectedStep}
              isInstance={isInstance}
              isEditMode={isEditMode}
              onStepChange={onStepChange}
            />
          </Box>
        </Grid>
      </Grid>
      {/* POPUP */}
      <Dialog
        open={branchIndex !== undefined && selectedStep !== undefined}
        onClose={handleCloseBranchEditor}
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: '1000px',
          },
        }}>
        {selectedStep && branchIndex !== undefined && (
          <BranchDetails
            selectedStep={selectedStep}
            selectedBranchIndex={branchIndex}
            steps={steps}
            isEditMode={isEditMode}
            onBranchChange={onBranchChange}
            onTargetStepChange={onTargetStepChange}
            onClose={handleCloseBranchEditor}
          />
        )}
      </Dialog>
    </Box>
  );
};
