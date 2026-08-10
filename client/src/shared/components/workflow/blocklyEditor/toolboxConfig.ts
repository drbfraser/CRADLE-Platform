import { WorkflowVariable } from 'src/shared/api';
import { blocklyTypeFromVariableType, TYPE_COLOURS } from './blocks';
import {
  groupVariablesBySource,
  sortedSourceKeys,
  variableBlockType,
  variableSourceLabel,
} from './variableGrouping';

const TYPE_LABELS: Record<string, string> = {
  Number: 'Number Variables',
  String: 'String Variables',
  Boolean: 'Boolean Variables',
  Date: 'Date Variables',
};

const COMPARISON_BLOCK_BY_TYPE: Record<string, string> = {
  Number: 'number_comparison',
  Date: 'date_comparison',
  String: 'string_comparison',
  Boolean: 'boolean_comparison',
};

const BLOCKLY_TYPES = ['Number', 'String', 'Boolean', 'Date'] as const;

function typesPresentInSource(variables: WorkflowVariable[]): Set<string> {
  return new Set(
    variables
      .map((v) => blocklyTypeFromVariableType(v.type))
      .filter((t): t is string => Boolean(t))
  );
}

function buildVariableCategories(variables: WorkflowVariable[]) {
  const sourceGroups = groupVariablesBySource(variables);

  return sortedSourceKeys(sourceGroups).map((sourceKey) => {
    const sourceVars = sourceGroups.get(sourceKey)!;
    const presentTypes = typesPresentInSource(sourceVars);

    return {
      kind: 'category',
      name: variableSourceLabel(sourceKey),
      colour: '20',
      contents: BLOCKLY_TYPES.filter((t) => presentTypes.has(t)).map((t) => ({
        kind: 'category',
        name: TYPE_LABELS[t],
        colour: String(TYPE_COLOURS[t]),
        contents: [{ kind: 'block', type: variableBlockType(sourceKey, t) }],
      })),
    };
  });
}

export function buildToolboxConfig(variables: WorkflowVariable[]) {
  const variableCategories = buildVariableCategories(variables);

  // Compare blocks are always available so authors can build conditions with
  // literal Values even when a step has no variables yet.
  const numberCompareCategory = {
    kind: 'category',
    name: 'Number Compare',
    colour: String(TYPE_COLOURS.Number),
    contents: [{ kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Number }],
  };

  const dateCompareCategory = {
    kind: 'category',
    name: 'Date Compare',
    colour: String(TYPE_COLOURS.Date),
    contents: [{ kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Date }],
  };

  const textCompareCategory = {
    kind: 'category',
    name: 'Text Compare',
    colour: String(TYPE_COLOURS.String),
    contents: [
      {
        kind: 'category',
        name: 'Comparison',
        colour: String(TYPE_COLOURS.String),
        contents: [{ kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.String }],
      },
      {
        kind: 'category',
        name: 'Operations',
        colour: String(TYPE_COLOURS.String),
        contents: [{ kind: 'block', type: 'string_op' }],
      },
    ],
  };

  const logicCompareCategory = {
    kind: 'category',
    name: 'Logic Compare',
    colour: '120',
    contents: [
      {
        kind: 'category',
        name: 'True/False',
        colour: String(TYPE_COLOURS.Boolean),
        contents: [{ kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Boolean }],
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
    ],
  };

  return {
    kind: 'categoryToolbox',
    contents: [
      ...variableCategories,
      numberCompareCategory,
      dateCompareCategory,
      textCompareCategory,
      logicCompareCategory,
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
