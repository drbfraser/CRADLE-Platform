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

  for (let i = 0; i < steps.length; i++) {
    steps[i].index = i + 1;
  }

  // ordering steps via breadth-first search
  var orderedSteps = [];
  var nextId = [firstStep];
  var ind = 1;
  while (nextId.length > 0) {
    // get next step
    let step = steps.find((step) => step.id == nextId[0]);
    nextId.splice(0,1);
    if (step) {
      // assign index to step
      step.index = ind;
      ind++;
      // remove step from steps
      let index = steps.indexOf(step);
      steps.splice(index, 1);
      orderedSteps.push(step);
      // add branching steps to queue
      if (step.branches) {
        step.branches.forEach((branch) => {
          nextId.push(branch.targetStepId);
        })
      }
    }
  }

  return (
    <>
      <Box>
        <h2>Steps</h2>
      </Box>
      {orderedSteps.map((step) => (
        <ViewTemplateStep step={step}></ViewTemplateStep>
      ))}
    </>
  );
};
