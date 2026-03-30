export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Variables',
      colour: '230',
      contents: [{ kind: 'block', type: 'app_variable' }],
    },
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
        { kind: 'block', type: 'boolean_value' },
      ],
    },
  ],
};
