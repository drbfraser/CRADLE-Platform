import { WorkflowVariable } from 'src/shared/api';
import { blocklyTypeFromVariableType } from './blocks';

const TYPE_LABELS: Record<string, string> = {
  Number: 'Number Variables',
  String: 'String Variables',
  Boolean: 'Boolean Variables',
  Date: 'Date Variables',
};

const TYPE_COLOURS: Record<string, string> = {
  Number: '30',
  String: '170',
  Boolean: '270',
  Date: '220',
};

export function buildToolboxConfig(variables: WorkflowVariable[]) {
  const presentTypes = new Set(
    variables.map((v) => blocklyTypeFromVariableType(v.type)).filter(Boolean)
  );

  const variableCategories = ['Number', 'String', 'Boolean', 'Date']
    .filter((t) => presentTypes.has(t))
    .map((t) => ({
      kind: 'category',
      name: TYPE_LABELS[t],
      colour: TYPE_COLOURS[t],
      contents: [{ kind: 'block', type: `app_variable_${t}` }],
    }));

  return {
    kind: 'categoryToolbox',
    contents: [
      ...variableCategories,
      {
        kind: 'category',
        name: 'Comparison',
        colour: '210',
        contents: [{ kind: 'block', type: 'comparison' }],
      },
      {
        kind: 'category',
        name: 'Logic',
        colour: '120',
        contents: [
          { kind: 'block', type: 'logic_op' },
          { kind: 'block', type: 'logic_negate' },
        ],
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
