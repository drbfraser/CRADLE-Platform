import { WorkflowVariable } from 'src/shared/api';
import { blocklyTypeFromVariableType, TYPE_COLOURS } from './blocks';

const TYPE_LABELS: Record<string, string> = {
  Number: 'Number Variables',
  String: 'String Variables',
  Boolean: 'Boolean Variables',
  Date: 'Date Variables',
};

const COMPARISON_LABELS: Record<string, string> = {
  Number: 'Number Compare',
  String: 'Text Compare',
  Boolean: 'True/False Compare',
  Date: 'Date Compare',
};

const COMPARISON_BLOCK_BY_TYPE: Record<string, string> = {
  Number: 'number_comparison',
  Date: 'date_comparison',
  String: 'string_comparison',
  Boolean: 'boolean_comparison',
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
      colour: String(TYPE_COLOURS[t]),
      contents: [{ kind: 'block', type: `app_variable_${t}` }],
    }));

  const comparisonCategories = ['Number', 'Date', 'String', 'Boolean']
    .filter((t) => presentTypes.has(t))
    .map((t) => ({
      kind: 'category',
      name: COMPARISON_LABELS[t],
      colour: String(TYPE_COLOURS[t]),
      contents: [{ kind: 'block', type: COMPARISON_BLOCK_BY_TYPE[t] }],
    }));

  return {
    kind: 'categoryToolbox',
    contents: [
      ...variableCategories,
      ...comparisonCategories,
      ...(presentTypes.has('String')
        ? [
            {
              kind: 'category',
              name: 'Text Operations',
              colour: String(TYPE_COLOURS.String),
              contents: [{ kind: 'block', type: 'string_op' }],
            },
          ]
        : []),
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
