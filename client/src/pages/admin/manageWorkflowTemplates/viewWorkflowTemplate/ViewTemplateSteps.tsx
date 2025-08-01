import Box from '@mui/material/Box/Box';
import { TemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowTypes';
import { ViewTemplateStep } from './ViewTemplateStep';
import { ID } from 'src/shared/constants';

interface IProps {
  steps: TemplateStepWithFormAndIndex[] | undefined;
  firstStep: ID;
}

export const ViewTemplateSteps = ({ steps, firstStep }: IProps) => {
  // console.log("🚀 ViewTemplateSteps received:", { steps, firstStep });
  if (!steps) {
    return;
  }

  // ordering steps via depth-first search
  const orderedSteps = [];
  const nextId = [firstStep];
  let ind = 1;
  const stepQueue = [...steps]; // ← CLONE!

  while (nextId.length > 0) {
    const step = stepQueue.find((step) => step.id === nextId[0]);
    nextId.splice(0, 1);
    if (step) {
      step.index = ind++;
      const index = stepQueue.indexOf(step);
      stepQueue.splice(index, 1); // safe mutation
      orderedSteps.push(step);
      if (step.branches) {
        step.branches.forEach((branch) => {
          nextId.push(branch.targetStepId);
        });
      }
    }
  }

  return (
    <>
      {orderedSteps.map((step) => (
        <Box key={step.id} mb={1}>
          <ViewTemplateStep step={step} />
        </Box>
      ))}
    </>
  );
};
