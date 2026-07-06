import { describe, it, expect } from 'vitest';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import {
  calculateNodeLevels,
  calculateStepPositions,
  HORIZONTAL_SPACING,
  VERTICAL_SPACING,
} from 'src/shared/components/workflow/workflowTemplate/flowLayout';

function makeStep(
  id: string,
  options: {
    index?: number;
    targets?: string[];
  } = {}
): WorkflowTemplateStepWithFormAndIndex {
  const { index = 0, targets = [] } = options;
  return {
    id,
    name: id,
    description: '',
    lastEdited: 0,
    index,
    branches: targets.map((targetStepId, branchIndex) => ({
      id: `${id}-branch-${branchIndex}`,
      stepId: id,
      targetStepId,
    })),
  };
}

describe('calculateNodeLevels', () => {
  it('assigns increasing levels along a linear chain', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['a'] }),
      makeStep('a', { index: 2, targets: ['b'] }),
      makeStep('b', { index: 3 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');

    expect(levels.get('root')).toBe(0);
    expect(levels.get('a')).toBe(1);
    expect(levels.get('b')).toBe(2);
  });

  it('uses the shallowest parent level for merge nodes', () => {
    // root -> long -> merge
    // root -> short -> merge
    // long -> deep
    const steps = [
      makeStep('root', { index: 1, targets: ['long', 'short'] }),
      makeStep('long', { index: 2, targets: ['deep'] }),
      makeStep('deep', { index: 3, targets: ['merge'] }),
      makeStep('short', { index: 4, targets: ['merge'] }),
      makeStep('merge', { index: 5 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');

    expect(levels.get('long')).toBe(1);
    expect(levels.get('short')).toBe(1);
    expect(levels.get('deep')).toBe(2);
    expect(levels.get('merge')).toBe(2);
  });

  it('does not assign levels to unreachable steps', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['a'] }),
      makeStep('a', { index: 2 }),
      makeStep('orphan', { index: 3 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');

    expect(levels.has('orphan')).toBe(false);
  });

  it('terminates when a cycle is reachable from the root', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['a'] }),
      makeStep('a', { index: 2, targets: ['b'] }),
      makeStep('b', { index: 3, targets: ['a'] }),
    ];

    const levels = calculateNodeLevels(steps, 'root');

    expect(levels.get('root')).toBe(0);
    expect(levels.get('a')).toBe(1);
    expect(levels.get('b')).toBe(2);
  });
});

describe('calculateStepPositions', () => {
  it('places unreachable steps on the orphan row', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['a'] }),
      makeStep('a', { index: 2 }),
      makeStep('orphan', { index: 3 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');
    const positions = calculateStepPositions(steps, 'root', levels);

    expect(positions.get('orphan')).toEqual({ x: 0, y: -VERTICAL_SPACING });
  });

  it('centers merge nodes between their parents horizontally', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['left', 'right'] }),
      makeStep('left', { index: 2, targets: ['merge'] }),
      makeStep('right', { index: 3, targets: ['merge'] }),
      makeStep('merge', { index: 4 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');
    const positions = calculateStepPositions(steps, 'root', levels);

    const leftX = positions.get('left')!.x;
    const rightX = positions.get('right')!.x;
    const mergeX = positions.get('merge')!.x;

    expect(leftX).toBeLessThan(mergeX);
    expect(mergeX).toBeLessThan(rightX);
    expect(mergeX).toBeCloseTo((leftX + rightX) / 2, 5);
  });

  it('spaces siblings at the same level evenly', () => {
    const steps = [
      makeStep('root', { index: 1, targets: ['a', 'b', 'c'] }),
      makeStep('a', { index: 2 }),
      makeStep('b', { index: 3 }),
      makeStep('c', { index: 4 }),
    ];

    const levels = calculateNodeLevels(steps, 'root');
    const positions = calculateStepPositions(steps, 'root', levels);

    const xs = ['a', 'b', 'c'].map((id) => positions.get(id)!.x).sort((x, y) => x - y);
    expect(xs[1]! - xs[0]!).toBe(HORIZONTAL_SPACING);
    expect(xs[2]! - xs[1]!).toBe(HORIZONTAL_SPACING);
  });
});
