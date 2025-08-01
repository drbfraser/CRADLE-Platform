import Box from '@mui/material/Box/Box';
import { TemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowTypes';
import { ViewTemplateStep } from './ViewTemplateStep';
import { ID } from 'src/shared/constants';

interface IProps {
  steps: TemplateStepWithFormAndIndex[] | undefined;
  firstStep: ID;
}

export const ViewTemplateSteps = ({ steps, firstStep }: IProps) => {
  if (!steps) {
    return;
  }

  // ordering steps via depth-first search
  const orderedSteps = [];
  const nextId = [firstStep];
  let ind = 1;
  while (nextId.length > 0) {
    // get next step
    const id = nextId.pop();
    const step = steps.find((step) => step.id == id);
    if (step) {
      // assign index to step
      step.index = ind;
      ind++;
      // remove step from steps
      const index = steps.indexOf(step);
      steps.splice(index, 1);
      orderedSteps.push(step);
      // add branching steps to stack
      if (step.branches) {
        step.branches.reverse().forEach((branch) => {
          nextId.push(branch.targetStepId);
        });
      }
    }
  }

  return (
    <>
      <Box>
        <h2>Steps</h2>
      </Box>
      {orderedSteps.map((step) => (
        <ViewTemplateStep key={step.id} step={step}></ViewTemplateStep>
      ))}
    </>
  );
};
