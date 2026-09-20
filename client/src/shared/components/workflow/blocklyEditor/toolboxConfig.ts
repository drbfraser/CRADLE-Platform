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

  const checkConditionCategory = {
    kind: 'category',
    name: 'Check a Condition',
    colour: '210',
    contents: [
      { kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Number },
      { kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Date },
      { kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.Boolean },
      { kind: 'block', type: COMPARISON_BLOCK_BY_TYPE.String },
      { kind: 'block', type: 'string_op' },
    ],
  };

  const combineConditionCategory = {
    kind: 'category',
    name: 'Combine Conditions',
    colour: '120',
    contents: [
      { kind: 'block', type: 'logic_op' },
      { kind: 'block', type: 'logic_negate' },
    ],
  };

  return {
    kind: 'categoryToolbox',
    contents: [
      checkConditionCategory,
      combineConditionCategory,
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
      {
        kind: 'category',
        name: 'Variables',
        colour: '265',
        contents: [...variableCategories],
      },
    ],
  };
}
