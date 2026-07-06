import * as Blockly from 'blockly';
import type { DynamicShape } from 'blockly/core/renderers/common/constants';

const RENDERER_NAME = 'cradle_typed_zelos';

/** Zelos SHAPES.PUZZLE — used for date value connections. */
export const DATE_OUTPUT_SHAPE = 4;

let registered = false;

function lineTo(x: number, y: number): string {
  return ` l ${x},${y} `;
}

/**
 * Zelos renderer that maps workflow value types to distinct connection shapes:
 * Number → rounded, String → squared, Boolean → hexagonal, Date → diamond tab.
 */
class TypedConstantProvider extends Blockly.zelos.ConstantProvider {
  DATE: DynamicShape | null = null;

  constructor(gridUnit?: number) {
    super(gridUnit);
    const g = this.GRID_UNIT;
    const datePadding = 2 * g;
    this.SHAPE_IN_SHAPE_PADDING[DATE_OUTPUT_SHAPE] = {
      0: 5 * g,
      1: 2 * g,
      2: 5 * g,
      3: 2 * g,
      [DATE_OUTPUT_SHAPE]: datePadding,
    };
    for (const outer of [
      this.SHAPES.HEXAGONAL,
      this.SHAPES.ROUND,
      this.SHAPES.SQUARE,
    ]) {
      this.SHAPE_IN_SHAPE_PADDING[outer][DATE_OUTPUT_SHAPE] = datePadding;
    }
  }

  override init(): void {
    super.init();
    this.DATE = this.makeDateDiamond();
  }

  /**
   * Diamond-shaped tab (distinct from rounded / squared / hexagonal) for dates.
   */
  protected makeDateDiamond(): DynamicShape {
    const maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH;

    const path = (height: number, flipUp: boolean, flipRight: boolean) => {
      const halfH = ((flipUp ? -1 : 1) * height) / 2;
      let w = height / 2;
      if (w > maxWidth) w = maxWidth;
      const dir = flipRight ? -1 : 1;
      return lineTo(dir * w, halfH) + lineTo(-dir * w, halfH);
    };

    return {
      type: this.SHAPES.PUZZLE,
      isDynamic: true,
      width(height: number) {
        const w = height / 2;
        return w > maxWidth ? maxWidth : w;
      },
      height(height: number) {
        return height;
      },
      connectionOffsetY(height: number) {
        return height / 2;
      },
      connectionOffsetX(width: number) {
        return -width;
      },
      pathDown(height: number) {
        return path(height, false, false);
      },
      pathUp(height: number) {
        return path(height, true, false);
      },
      pathRightDown(height: number) {
        return path(height, false, true);
      },
      pathRightUp(height: number) {
        return path(height, false, true);
      },
    };
  }

  override shapeFor(connection: Blockly.RenderedConnection) {
    if (
      connection.type !== Blockly.ConnectionType.INPUT_VALUE &&
      connection.type !== Blockly.ConnectionType.OUTPUT_VALUE
    ) {
      return super.shapeFor(connection);
    }

    const outputShape = connection.getSourceBlock()?.getOutputShape();
    if (outputShape === this.SHAPES.PUZZLE) {
      return this.DATE!;
    }
    if (outputShape !== null && outputShape !== undefined) {
      return super.shapeFor(connection);
    }

    let checks = connection.getCheck();
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck();
    }

    const checkList = checks
      ? Array.isArray(checks)
        ? checks
        : [checks]
      : [];

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
      return this.DATE!;
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
