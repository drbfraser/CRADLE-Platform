# Blockly Condition Editor

Visual block-based editor for building workflow branch conditions. Users drag and connect blocks to create logic formulas (e.g. `Patient's Age > 18 AND Patient's Age < 65`)

## How it works

1. User opens a branch condition in the workflow template editor
2. A Blockly workspace appears with draggable blocks
3. User builds a condition by connecting blocks together
4. The workspace is converted to a **JSON Logic** string on every meaningful change
5. That JSON Logic string is saved as the branch's `condition.rule` and evaluated by the backend's `json_logic` engine

## File overview

| File                    | Purpose                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `blocks.ts`             | Registers custom Blockly block types (variable, comparison, logic, values)          |
| `jsonLogicGenerator.ts` | Converts a Blockly workspace into a JSON Logic string                               |
| `jsonLogicToBlocks.ts`  | Loads an existing JSON Logic string back into blocks (for editing saved conditions) |
| `toolboxConfig.ts`      | Defines the sidebar categories (Variables, Comparison, Logic, Values)               |
| `BlocklyEditor.tsx`     | React component that wraps the Blockly workspace                                    |
| `index.ts`              | Barrel export                                                                       |

## JSON Logic format

The editor outputs standard [JSON Logic](https://jsonlogic.com) that the backend evaluates directly.

```json
// Simple: Patient's Age < 18
{"<": [{"var": "patient.age"}, 18]}

// Compound: Patient's Age >= 18 AND Patient's Age < 65
{"and": [{">=": [{"var": "patient.age"}, 18]}, {"<": [{"var": "patient.age"}, 65]}]}

// Negation: NOT (Patient's Age > 100)
{"!": {">": [{"var": "patient.age"}, 100]}}
```

## Available blocks

- **Variables**: Application variables (currently only "Patient's Age" / `patient.age`)
- **Comparison**: `<`, `>`, `=`, `<=`, `>=`, `!=` with left and right value inputs
- **Logic**: `AND`, `OR` (two boolean inputs), `NOT` (one boolean input)
- **Values**: Number input, Boolean (true/false) dropdown

Navigate to a workflow template, click a branch edge or "+" button to open the condition editor.

## Known limitations / next steps

- **Variables are hardcoded** to just `patient.age`. A future PR should fetch available variables dynamically from `GET /api/workflow/variables`.
- **Only the first top-level block** is used as the condition. Disconnected blocks in the workspace are ignored.
