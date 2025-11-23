import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  Divider,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect, useMemo, useState } from 'react';
import { useUndoRedo } from 'src/shared/hooks/workflowTemplate/useUndoRedo';
import { useQuery } from '@tanstack/react-query';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { getTemplateWithStepsAndClassification } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowMetadata } from '../../../shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';
import { useEditWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewWorkflow = location.state?.viewWorkflow;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState<WorkflowTemplate | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>();

  // Undo redo state
  const {
    init: initHistory,
    captureCurrentState,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    historyManager,
  } = useUndoRedo(editedWorkflow, setEditedWorkflow);

  // Debug log for undo redo history
  useEffect(() => {
    console.log('History Array:', historyManager.history);
    console.log('Current Index:', historyManager.currentIndex);
    console.log('Total States:', historyManager.history.length);
  }, [historyManager]);

  // View mode state
  const [viewMode, setViewMode] = useState<WorkflowViewMode>(
    WorkflowViewMode.FLOW
  );

  // Fetch the workflow template data to ensure it's always up-to-date
  const workflowTemplateQuery = useQuery({
    queryKey: ['workflowTemplate', viewWorkflow?.id],
    queryFn: async (): Promise<WorkflowTemplate> => {
      if (!viewWorkflow?.id)
        throw new Error('No workflow template ID provided');
      const result = await getTemplateWithStepsAndClassification(
        viewWorkflow.id
      );
      return result;
    },
    enabled: !!viewWorkflow?.id,
    initialData: viewWorkflow,
  });

  const editWorkflowTemplateMutation = useEditWorkflowTemplate();

  useEffect(() => {
    if (isEditMode && workflowTemplateQuery.data && !editedWorkflow) {
      setEditedWorkflow({ ...workflowTemplateQuery.data });
    }
  }, [isEditMode, workflowTemplateQuery.data, editedWorkflow]);

  const isLoading = workflowTemplateQuery.isPending;

  const dash = (v?: string) => (v && String(v).trim() ? v : '—');
  const collectionName = useMemo(
    () => dash(workflowTemplateQuery.data?.classification?.name),
    [workflowTemplateQuery.data]
  );

  // Edit mode functions
  const handleEdit = () => {
    setIsEditMode(true);
    const initialWorkflow = { ...workflowTemplateQuery.data };
    setEditedWorkflow(initialWorkflow);
    setHasChanges(false);

    initHistory(initialWorkflow);
  };

  // Cancel edit mode
  const handleCancel = () => {
    setIsEditMode(false);
    setEditedWorkflow(null);
    setHasChanges(false);

    clearHistory();
  };

  // handler for saving changes
  const handleSave = async () => {
    if (!editedWorkflow || !hasChanges) return;

    // Frontend guard: require version bump to avoid 409 from backend
    const originalVersion = workflowTemplateQuery.data?.version;
    if (editedWorkflow.version === originalVersion) {
      setToastMsg(
        'Please change the version before saving. A template with this version already exists.'
      );
      setToastOpen(true);
      return;
    }

    try {
      await editWorkflowTemplateMutation.mutateAsync({
        template: editedWorkflow,
      });

      clearHistory();
      // Redirect to workflow templates page after successful save
      navigate('/admin/workflow-templates');
    } catch (error: any) {
      return;
    }
  };

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => ({
      ...prev!,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleStepChange = (stepId: string, field: string, value: string) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps?.map((step) => {
        if (step.id === stepId) {
          return { ...step, [field]: value };
        }
        return step;
      });

      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    setHasChanges(true);
  };

  const handleInsertNode = (stepId: string) => {
    if (!editedWorkflow) return;

    // Get the current step
    const currentStep = editedWorkflow.steps.find((s) => s.id === stepId);
    if (!currentStep) {
      return;
    }

    // Generate a unique ID for the new step
    // (It will be overridden by the backend, so it doesn't matter what we use here)
    const newStepId = `step-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Determine the next step connections
    // If current step has branches, preserve them for the new step
    // If no branches, the new step will be a terminal node (no branches)
    const newStepBranches =
      currentStep.branches && currentStep.branches.length > 0
        ? currentStep.branches.map((branch) => ({
            ...branch,
            stepId: newStepId, // Update stepId reference to new step
          }))
        : [];

    // Create a new step
    const newStep = {
      id: newStepId,
      name: 'New Step',
      description: 'Add description here',
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: newStepBranches,
    };

    // Update current step to point all its branches to the new step
    const updatedCurrentStep = {
      ...currentStep,
      branches:
        currentStep.branches && currentStep.branches.length > 0
          ? currentStep.branches.map((branch) => ({
              ...branch,
              targetStepId: newStepId, // All branches now point to new step
            }))
          : [{ stepId: currentStep.id, targetStepId: newStepId }], // If no branches existed, create one pointing to new step
    };

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow with the modifications
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      // Replace the current step with updated version
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? updatedCurrentStep : step
      );

      // Add the new step to the array
      newWorkflow = {
        ...prev,
        steps: [...updatedSteps, newStep],
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Auto-select the newly created step
    setSelectedStepId(newStepId);

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleAddBranch = (stepId: string) => {
    if (!editedWorkflow) return;

    // Get the current step
    const currentStep = editedWorkflow.steps.find((s) => s.id === stepId);
    if (!currentStep) {
      return;
    }

    // Generate a unique ID for the new step
    // (It will be overridden by the backend, so it doesn't matter what we use here)
    const newStepId = `step-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create a new step that will be the target of the new branch
    const newStep = {
      id: newStepId,
      name: 'New Branch Step',
      description: 'Add description here',
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: [], // New branch step has no outgoing branches initially
    };

    // Add a new branch to the current step
    const newBranch = {
      stepId: stepId, // Reference to the source step
      targetStepId: newStepId, // Points to the new step
      condition: undefined, // No condition initially - user can add later
    };

    // Add the new branch to the current step's branches
    const updatedCurrentStep = {
      ...currentStep,
      branches: currentStep.branches
        ? [...currentStep.branches, newBranch]
        : [newBranch],
    };

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      // Replace the current step with updated version
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? updatedCurrentStep : step
      );

      // Add the new step to the array
      newWorkflow = {
        ...prev,
        steps: [...updatedSteps, newStep],
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Auto-select the newly created step
    setSelectedStepId(newStepId);

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleConnectionCreate = (
    sourceStepId: string,
    targetStepId: string
  ) => {
    if (!editedWorkflow) return;

    // Find the source step
    const sourceStep = editedWorkflow.steps.find((s) => s.id === sourceStepId);
    if (!sourceStep) {
      return;
    }

    // Create a new branch for the connection
    const newBranch = {
      stepId: sourceStepId,
      targetStepId: targetStepId,
      condition: undefined, // No condition initially
    };

    // Add the new branch to the source step
    const updatedSourceStep = {
      ...sourceStep,
      branches: sourceStep.branches
        ? [...sourceStep.branches, newBranch]
        : [newBranch],
    };

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) =>
        step.id === sourceStepId ? updatedSourceStep : step
      );

      newWorkflow = {
        ...prev,
        steps: updatedSteps,
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleDeleteNode = (stepId: string) => {
    if (!editedWorkflow) return;

    if (stepId === editedWorkflow.startingStepId) {
      setToastMsg('Cannot delete the starting step');
      setToastOpen(true);
      return;
    }

    const incomingConnections = new Map<string, string[]>();
    editedWorkflow.steps.forEach((step) => {
      if (step.branches) {
        step.branches.forEach((branch) => {
          const parents = incomingConnections.get(branch.targetStepId) || [];
          parents.push(step.id);
          incomingConnections.set(branch.targetStepId, parents);
        });
      }
    });

    // DFS to collect all nodes to delete
    const nodesToDelete = new Set<string>();
    const visited = new Set<string>();

    const dfsToDelete = (currentStepId: string) => {
      if (visited.has(currentStepId)) return;

      visited.add(currentStepId);

      nodesToDelete.add(currentStepId);

      const currentStep = editedWorkflow.steps.find(
        (s) => s.id === currentStepId
      );
      if (!currentStep?.branches) return;

      currentStep.branches.forEach((branch) => {
        const targetStepId = branch.targetStepId;
        const parents = incomingConnections.get(targetStepId) || [];

        // DFS continue only if the target has only one parent (the current node)
        const hasOnlyThisParent =
          parents.length === 1 && parents[0] === currentStepId;

        // Or if all parents marked for deletion
        const allParentsDeleted = parents.every(
          (parentId) =>
            nodesToDelete.has(parentId) || parentId === currentStepId
        );

        if (hasOnlyThisParent || allParentsDeleted) {
          dfsToDelete(targetStepId);
        }
      });
    };

    dfsToDelete(stepId);

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Remove all nodes to delete from the workflow
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps
        .filter((step) => !nodesToDelete.has(step.id))
        .map((step) => {
          if (step.branches) {
            const cleanedBranches = step.branches.filter(
              (branch) => !nodesToDelete.has(branch.targetStepId)
            );
            return {
              ...step,
              branches: cleanedBranches.length > 0 ? cleanedBranches : [],
            };
          }
          return step;
        });

      newWorkflow = {
        ...prev,
        steps: updatedSteps,
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Clear selected step if it was deleted
    if (nodesToDelete.has(selectedStepId || '')) {
      setSelectedStepId(undefined);
    }

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const currentWorkflow = isEditMode
    ? editedWorkflow
    : workflowTemplateQuery.data;

  return (
    <>
      {(workflowTemplateQuery.isError ||
        editWorkflowTemplateMutation.isError) && <APIErrorToast />}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Go back" placement="top">
              <IconButton
                onClick={() => navigate(`/admin/workflow-templates`)}
                size="medium">
                <ChevronLeftIcon color="inherit" fontSize="large" />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h2" sx={{ ml: 0.5 }}>
              Workflow Template: {dash(currentWorkflow?.name)}
            </Typography>
          </Box>

          {!isEditMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={workflowTemplateQuery.data?.archived}>
              Edit
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={editWorkflowTemplateMutation.isPending}>
                Discard
              </Button>
              <Button
                variant="contained"
                startIcon={
                  editWorkflowTemplateMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSave}
                disabled={
                  !hasChanges || editWorkflowTemplateMutation.isPending
                }>
                {editWorkflowTemplateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          )}
        </Box>

        {isEditMode && hasChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have unsaved changes. Don&apos;t forget to save your work!
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
          Workflow Template Basic Info
        </Typography>

        {/* meta data display component */}
        <WorkflowMetadata
          name={currentWorkflow?.name}
          description={currentWorkflow?.description}
          collectionName={collectionName}
          version={currentWorkflow?.version}
          lastEdited={currentWorkflow?.lastEdited}
          archived={currentWorkflow?.archived}
          dateCreated={currentWorkflow?.dateCreated}
          isEditMode={isEditMode}
          onFieldChange={handleFieldChange}
        />

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}>
          <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
            {`Workflow Template Steps${
              typeof workflowTemplateQuery.data?.steps?.length === 'number'
                ? ` (${workflowTemplateQuery.data.steps.length})`
                : ''
            }`}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant={
                viewMode === WorkflowViewMode.FLOW ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => setViewMode(WorkflowViewMode.FLOW)}
              disabled={isEditMode}>
              Flow View
            </Button>
            <Button
              variant={
                viewMode === WorkflowViewMode.LIST ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => setViewMode(WorkflowViewMode.LIST)}
              disabled={isEditMode}>
              List View
            </Button>
          </Stack>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : viewMode === WorkflowViewMode.FLOW ? (
          <WorkflowFlowView
            steps={
              currentWorkflow?.steps as WorkflowTemplateStepWithFormAndIndex[]
            }
            firstStepId={currentWorkflow?.startingStepId || ''}
            isInstance={false}
            isEditMode={isEditMode}
            selectedStepId={selectedStepId}
            onStepSelect={setSelectedStepId}
            onStepChange={handleStepChange}
            onInsertNode={handleInsertNode}
            onAddBranch={handleAddBranch}
            onConnectionCreate={handleConnectionCreate}
            onDeleteNode={handleDeleteNode}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
        ) : (
          <WorkflowSteps
            steps={
              currentWorkflow?.steps as WorkflowTemplateStepWithFormAndIndex[]
            }
            firstStep={currentWorkflow?.startingStepId}
            isInstance={false}
          />
        )}
      </Paper>
      <Toast
        severity="warning"
        message={toastMsg}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};
