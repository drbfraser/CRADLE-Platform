import { Nullable } from 'src/shared/constants';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  PossibleStep,
} from 'src/shared/types/workflow/workflowUiTypes';
import { getWorkflowCurrentStep } from './stepTree';

export function parseYMD(d?: Nullable<string>) {
  if (!d) return undefined;
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, day ?? 1);
  return isNaN(dt.getTime()) ? undefined : dt;
}

export function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function computeProgressAndEta(steps: InstanceStep[], now = new Date()) {
  const total = steps.length || 1;
  const completed = steps.filter(
    (s) => s.status === StepStatus.COMPLETED
  ).length;
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.status === StepStatus.ACTIVE)
  );
  const percent = Math.round((completed / total) * 100);

  // Estimate days per step
  const durations: number[] = [];
  for (const s of steps) {
    const start = parseYMD(s.startedOn);
    const end = parseYMD(s.completedOn);
    if (start && end) durations.push(daysBetween(start, end));
  }
  const defaultDaysPerStep = 7;
  const avgDaysPerStep = durations.length
    ? Math.max(
        1,
        Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      )
    : defaultDaysPerStep;

  const remaining = total - completed;
  const estDaysRemaining = remaining > 0 ? remaining * avgDaysPerStep : 0;
  const etaDate =
    remaining > 0
      ? new Date(now.getTime() + estDaysRemaining * 86400000)
      : undefined;

  return { total, completed, percent, estDaysRemaining, etaDate, currentIndex };
}

export function getWorkflowShortestPath(instance: InstanceDetails): number {
  const currentStep = getWorkflowCurrentStep(instance);
  if (!currentStep) return Infinity; // TODO: better handling of no active step case

  const root = instance.possibleSteps;
  const queue: PossibleStep[] = [root];
  const visited = new Set<PossibleStep>([root]);

  while (queue.length > 0) {
    const step = queue.shift()!; // TODO: better handling of empty queue case
    if (step.id === currentStep.id) {
      return step.shortestPathLength;
    }

    for (const branch of step.branches) {
      if (branch.id === currentStep.id) {
        return branch.shortestPathLength;
      }
      if (!visited.has(branch)) {
        visited.add(branch);
        queue.push(branch);
      }
    }
  }

  return Infinity;
}
