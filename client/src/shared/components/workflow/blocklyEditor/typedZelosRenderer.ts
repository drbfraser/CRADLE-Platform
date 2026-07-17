import * as Blockly from 'blockly';

const RENDERER_NAME = 'cradle_typed_zelos';

/** Zelos SHAPES.ROUND — date uses rounded tabs so YYYY-MM-DD text is readable. */
export const DATE_OUTPUT_SHAPE = 2;

let registered = false;
/**
 * Zelos renderer that maps workflow value types to distinct connection shapes:
 * Number → rounded, String → squared, Boolean → hexagonal, Date → rounded (blue).
 */
class TypedConstantProvider extends Blockly.zelos.ConstantProvider {
  override shapeFor(connection: Blockly.RenderedConnection) {
    if (
      connection.type !== Blockly.ConnectionType.INPUT_VALUE &&
      connection.type !== Blockly.ConnectionType.OUTPUT_VALUE
    ) {
      return super.shapeFor(connection);
    }

    const outputShape = connection.getSourceBlock()?.getOutputShape();
    if (outputShape !== null && outputShape !== undefined) {
      return super.shapeFor(connection);
    }

    let checks = connection.getCheck();
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck();
    }

    const checkList = checks ? (Array.isArray(checks) ? checks : [checks]) : [];

    if (checkList.includes('Boolean')) {
      return this.HEXAGONAL!;
    }
    if (checkList.includes('Number')) {
      return this.ROUNDED!;
    }
    if (checkList.includes('String')) {
      return this.SQUARED!;
    }
    if (checkList.includes('Date')) {
      return this.ROUNDED!;
    }

    return this.ROUNDED!;
  }
}

class TypedZelosRenderer extends Blockly.zelos.Renderer {
  constructor() {
    super(RENDERER_NAME);
  }

  protected override makeConstants_(): TypedConstantProvider {
    return new TypedConstantProvider();
  }
}

export function registerTypedZelosRenderer(): void {
  if (registered) return;
  Blockly.registry.register(
    Blockly.registry.Type.RENDERER,
    RENDERER_NAME,
    TypedZelosRenderer
  );
  registered = true;
}

export const TYPED_ZELOS_RENDERER = RENDERER_NAME;
