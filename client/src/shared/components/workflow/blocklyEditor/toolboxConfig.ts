import { WorkflowVariable } from 'src/shared/api';
import {
  genericVariableBlockType,
  groupVariablesBySource,
  sortedSourceKeys,
  variableSourceLabel,
} from './variableGrouping';

function buildVariableCategories(variables: WorkflowVariable[]) {
  const sourceGroups = groupVariablesBySource(variables);

  return sortedSourceKeys(sourceGroups).map((sourceKey) => ({
    kind: 'category',
    name: `${variableSourceLabel(sourceKey)} info`,
    colour: '20',
    contents: [{ kind: 'block', type: genericVariableBlockType(sourceKey) }],
  }));
}

export function buildToolboxConfig(variables: WorkflowVariable[]) {
  const variableCategories = buildVariableCategories(variables);

  const compareAndLogicCategory = {
    kind: 'category',
    name: 'Comparisons and Logic',
    colour: '120',
    contents: [
      { kind: 'block', type: 'logic_op' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'generic_comparison' },
      { kind: 'block', type: 'string_op' },
    ],
  };

  return {
    kind: 'categoryToolbox',
    contents: [
      compareAndLogicCategory,
      {
        kind: 'category',
        name: 'Variables',
        colour: '265',
        contents: [...variableCategories],
      },
      {
        kind: 'category',
        name: 'Values',
        colour: '160',
        contents: [
          { kind: 'block', type: 'number_value' },
          { kind: 'block', type: 'string_value' },
          { kind: 'block', type: 'boolean_value' },
          { kind: 'block', type: 'date_value' },
        ],
      },
    ],
  };
}
