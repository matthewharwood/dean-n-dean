import { type AlchemistGuildElementQuantities, ELEMENT_CARDS } from "@dean-stack/schemas";
import type { Application, Ticker } from "pixi.js";
import { Container, Graphics, Text } from "pixi.js";

const CELL_WIDTH = 48;
const CELL_HEIGHT = 58;
const CELL_GAP = 4;
const TITLE_HEIGHT = 42;
const TABLE_COLUMNS = 18;
const TABLE_ROWS = 9;
const MIN_SCALE = 0.45;
const MAX_SCALE = 3.2;
const FIT_PADDING = 46;
const TEXT_RESOLUTION = 2;
const PRIMARY_POINTER_BUTTON = 0;
const MIDDLE_POINTER_BUTTON = 1;
const PERIODIC_TABLE_FONT_FAMILY = '"Atkinson Hyperlegible", Arial, sans-serif';
const WORLD_FOG_MARGIN = 2600;
const WORLD_FOG_PERIMETER_EXPANSIONS = [126, 74, 38] as const;
const WORLD_FOG_ORGANIC_POINT_COUNT = 40;
const WORLD_FOG_ROLLING_LAYER_COUNT = 13;
const WORLD_FOG_DARK_COLOR = 0x020617;
const WORLD_FOG_DEEP_COLOR = 0x0f172a;
const WORLD_FOG_COOL_COLOR = 0x1e293b;
const WORLD_FOG_MIST_COLOR = 0x64748b;
const CELL_FOG_LIGHT_COLOR = 0xf8fafc;
const CELL_FOG_MID_COLOR = 0xdbeafe;
const CELL_FOG_SHADOW_COLOR = 0x94a3b8;
const CELL_FOG_DEEP_COLOR = 0x334155;
const CELL_FOG_PUFFS = 3;
export const FLOATING_ELEMENT_CARD_WIDTH = 105;
export const FLOATING_ELEMENT_CARD_HEIGHT = 148;

export type PeriodicElementCard = (typeof ELEMENT_CARDS)[number];
export type PeriodicTableElementGrab = {
  card: PeriodicElementCard;
  clientX: number;
  clientY: number;
  grabOffsetX: number;
  grabOffsetY: number;
  pointerId: number;
};

type PeriodicTableSceneOptions = {
  discoveredElementIds?: readonly string[];
  elementQuantities?: Readonly<AlchemistGuildElementQuantities>;
  getFitRect?: () => DOMRect | null;
  getInteractionRect?: () => DOMRect | null;
  onElementGrab?: (grab: PeriodicTableElementGrab) => void;
  reducedMotion?: boolean;
};

type PeriodicElementAccess = {
  discovered: boolean;
  quantity: number;
};

type ScreenPoint = {
  id: number;
  x: number;
  y: number;
};

type PointPair = [ScreenPoint, ScreenPoint];

type InteractionState = {
  pointers: Map<number, ScreenPoint>;
};

type ElementHit = {
  card: PeriodicElementCard;
  grabOffsetX: number;
  grabOffsetY: number;
};

type ViewRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type FogMotionTarget = Container | Graphics;

type FogMotion = {
  alphaPulse: number;
  baseAlpha: number;
  baseRotation: number;
  baseScaleX: number;
  baseScaleY: number;
  baseX: number;
  baseY: number;
  driftX: number;
  driftY: number;
  phase: number;
  rotationDrift: number;
  scalePulse: number;
  speed: number;
  target: FogMotionTarget;
};

type FogDisplay = {
  container: Container;
  motions: FogMotion[];
};

type FogMotionOptions = {
  alphaPulse?: number;
  driftX?: number;
  driftY?: number;
  rotationDrift?: number;
  scalePulse?: number;
  speed?: number;
};

const tableWidth = TABLE_COLUMNS * CELL_WIDTH + (TABLE_COLUMNS - 1) * CELL_GAP;
const tableHeight = TITLE_HEIGHT + TABLE_ROWS * CELL_HEIGHT + (TABLE_ROWS - 1) * CELL_GAP;

export function setupPeriodicTableScene(
  app: Application,
  options: PeriodicTableSceneOptions = {},
): () => void {
  const tableLayer = new Container();
  const elementAccess = createElementAccess(options);
  const state: InteractionState = { pointers: new Map() };
  const canvas = app.canvas;
  const resizeTarget = canvas.parentElement ?? canvas;
  let disposed = false;
  let resizeFrame = 0;

  app.stage.addChild(tableLayer);
  const fogMotions = drawPeriodicTable(tableLayer, elementAccess);
  let fogTimeSeconds = 0;

  const animateFog = (ticker: Ticker) => {
    if (disposed) return;

    fogTimeSeconds += ticker.deltaMS / 1000;
    updateFogMotions(fogMotions, fogTimeSeconds);
  };

  const renderNow = () => {
    if (disposed) return;
    app.render();
  };

  const fitTable = () => {
    if (disposed) return;
    const fitRect = getCanvasLocalFitRect();
    const availableWidth = Math.max(fitRect.width - FIT_PADDING * 2, tableWidth * MIN_SCALE);
    const availableHeight = Math.max(fitRect.height - FIT_PADDING * 2, tableHeight * MIN_SCALE);
    const scale = Math.min(availableWidth / tableWidth, availableHeight / tableHeight, 1);
    const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);

    tableLayer.scale.set(nextScale);
    tableLayer.position.set(
      fitRect.left + (fitRect.width - tableWidth * nextScale) / 2,
      fitRect.top + (fitRect.height - tableHeight * nextScale) / 2,
    );
  };

  const getCanvasLocalFitRect = (): ViewRect => {
    const fitRect = options.getFitRect?.() ?? options.getInteractionRect?.();
    if (!fitRect || fitRect.width <= 0 || fitRect.height <= 0) {
      return { height: app.screen.height, left: 0, top: 0, width: app.screen.width };
    }

    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = app.screen.width / Math.max(canvasRect.width, 1);
    const scaleY = app.screen.height / Math.max(canvasRect.height, 1);

    return {
      height: fitRect.height * scaleY,
      left: (fitRect.left - canvasRect.left) * scaleX,
      top: (fitRect.top - canvasRect.top) * scaleY,
      width: fitRect.width * scaleX,
    };
  };

  const isInInteractionRect = (event: MouseEvent): boolean => {
    const interactionRect = options.getInteractionRect?.();
    if (!interactionRect) return true;

    return (
      event.clientX >= interactionRect.left &&
      event.clientX <= interactionRect.right &&
      event.clientY >= interactionRect.top &&
      event.clientY <= interactionRect.bottom
    );
  };

  const zoomAt = (screenX: number, screenY: number, nextScale: number) => {
    if (disposed) return;
    const currentScale = tableLayer.scale.x;
    const worldX = (screenX - tableLayer.x) / currentScale;
    const worldY = (screenY - tableLayer.y) / currentScale;
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    tableLayer.scale.set(clampedScale);
    tableLayer.position.set(screenX - worldX * clampedScale, screenY - worldY * clampedScale);
    renderNow();
  };

  const getScreenPoint = (event: PointerEvent): ScreenPoint => {
    const rect = canvas.getBoundingClientRect();

    return {
      id: event.pointerId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const findElementHit = (point: ScreenPoint): ElementHit | null => {
    const worldX = (point.x - tableLayer.x) / tableLayer.scale.x;
    const worldY = (point.y - tableLayer.y) / tableLayer.scale.y;

    for (const card of ELEMENT_CARDS) {
      const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
      const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);
      const localX = worldX - x;
      const localY = worldY - y;

      if (localX < 0 || localX > CELL_WIDTH || localY < 0 || localY > CELL_HEIGHT) {
        continue;
      }

      if (isElementSelectable(card, elementAccess)) {
        return {
          card,
          grabOffsetX: (localX / CELL_WIDTH) * FLOATING_ELEMENT_CARD_WIDTH,
          grabOffsetY: (localY / CELL_HEIGHT) * FLOATING_ELEMENT_CARD_HEIGHT,
        };
      }
    }

    return null;
  };

  const handleWheel = (event: WheelEvent) => {
    if (disposed) return;
    if (!isInInteractionRect(event)) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const wheelScale = Math.exp(-event.deltaY * 0.001);

    zoomAt(pointerX, pointerY, tableLayer.scale.x * wheelScale);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (disposed) return;
    if (!isInInteractionRect(event)) return;
    if (event.button !== PRIMARY_POINTER_BUTTON && event.button !== MIDDLE_POINTER_BUTTON) return;
    event.preventDefault();
    const point = getScreenPoint(event);

    if (event.button === MIDDLE_POINTER_BUTTON) {
      beginPan(event, point);
      return;
    }

    const onElementGrab = options.onElementGrab;

    if (onElementGrab) {
      const elementHit = findElementHit(point);

      if (elementHit) {
        onElementGrab({
          card: elementHit.card,
          clientX: event.clientX,
          clientY: event.clientY,
          grabOffsetX: elementHit.grabOffsetX,
          grabOffsetY: elementHit.grabOffsetY,
          pointerId: event.pointerId,
        });
        return;
      }
    }

    beginPan(event, point);
  };

  const beginPan = (event: PointerEvent, point: ScreenPoint) => {
    canvas.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, point);
    canvas.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (disposed) return;
    const previous = state.pointers.get(event.pointerId);
    if (!previous) return;

    event.preventDefault();
    const beforePair = getPointerPair(state.pointers);
    const next = getScreenPoint(event);
    state.pointers.set(event.pointerId, next);
    const afterPair = getPointerPair(state.pointers);

    if (beforePair && afterPair) {
      const beforeDistance = distanceBetween(beforePair);
      const afterDistance = distanceBetween(afterPair);
      if (beforeDistance > 0) {
        const beforeCenter = midpointBetween(beforePair);
        const afterCenter = midpointBetween(afterPair);
        zoomAt(
          beforeCenter.x,
          beforeCenter.y,
          tableLayer.scale.x * (afterDistance / beforeDistance),
        );
        tableLayer.position.set(
          tableLayer.x + afterCenter.x - beforeCenter.x,
          tableLayer.y + afterCenter.y - beforeCenter.y,
        );
        renderNow();
      }
      return;
    }

    tableLayer.position.set(tableLayer.x + next.x - previous.x, tableLayer.y + next.y - previous.y);
    renderNow();
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (disposed) return;
    state.pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = state.pointers.size > 0 ? "grabbing" : "grab";
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (disposed || canvas.hasPointerCapture(event.pointerId)) return;
    handlePointerUp(event);
  };

  const preventMiddleClickDefault = (event: MouseEvent) => {
    if (disposed) return;
    if (event.button !== MIDDLE_POINTER_BUTTON || !isInInteractionRect(event)) return;
    event.preventDefault();
  };

  const handleResize = () => {
    if (disposed || resizeFrame !== 0) return;

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      fitTable();
      renderNow();
    });
  };

  canvas.style.cursor = "grab";
  canvas.addEventListener("mousedown", preventMiddleClickDefault);
  canvas.addEventListener("auxclick", preventMiddleClickDefault);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerLeave);

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(resizeTarget);
  handleResize();
  void document.fonts?.ready.then(renderNow);
  if (!options.reducedMotion) app.ticker.add(animateFog);

  return () => {
    disposed = true;
    app.ticker.remove(animateFog);
    if (resizeFrame !== 0) cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
    canvas.removeEventListener("mousedown", preventMiddleClickDefault);
    canvas.removeEventListener("auxclick", preventMiddleClickDefault);
    canvas.removeEventListener("wheel", handleWheel);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerUp);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.style.cursor = "";
  };
}

function drawPeriodicTable(
  tableLayer: Container,
  elementAccess: ReadonlyMap<string, PeriodicElementAccess>,
): FogMotion[] {
  const fogMotions: FogMotion[] = [];
  const worldFog = drawWorldFog();
  tableLayer.addChild(worldFog.container);
  fogMotions.push(...worldFog.motions);

  const title = new Text({
    text: "Periodic Table of the Elements",
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 22,
      fontWeight: "700",
      fill: 0x111111,
    },
  });
  title.anchor.set(0.5, 0);
  title.position.set(tableWidth / 2, 0);
  tableLayer.addChild(title);

  for (const card of ELEMENT_CARDS) {
    const cell = drawElementCell(card, getElementAccess(card, elementAccess));
    const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
    const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);

    cell.position.set(x, y);
    tableLayer.addChild(cell);
  }

  const cellFog = drawFogLayer(elementAccess);
  tableLayer.addChild(cellFog.container);
  fogMotions.push(...cellFog.motions);

  return fogMotions;
}

function drawWorldFog(): FogDisplay {
  const fog = new Container();
  const motions: FogMotion[] = [];
  const ambientFog = drawOrganicWorldFogField();
  const perimeterFog = drawPeriodicTablePerimeterFog();

  fog.addChild(ambientFog.container, perimeterFog.container);
  motions.push(...ambientFog.motions, ...perimeterFog.motions);

  return { container: fog, motions };
}

function drawOrganicWorldFogField(): FogDisplay {
  const container = new Container();
  const motions: FogMotion[] = [];
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const baseFog = drawOrganicBlob({
    alpha: 0.38,
    color: WORLD_FOG_DARK_COLOR,
    pointCount: WORLD_FOG_ORGANIC_POINT_COUNT,
    radiusX: tableWidth / 2 + WORLD_FOG_MARGIN,
    radiusY: tableHeight / 2 + WORLD_FOG_MARGIN,
    seed: 10,
  });
  baseFog.position.set(centerX, centerY);
  container.addChild(baseFog);
  motions.push(
    createFogMotion(baseFog, 12, {
      alphaPulse: 0.025,
      driftX: 28,
      driftY: -18,
      rotationDrift: 0.012,
      scalePulse: 0.008,
      speed: 0.1,
    }),
  );

  for (let index = 0; index < WORLD_FOG_ROLLING_LAYER_COUNT; index += 1) {
    const angle = (index / WORLD_FOG_ROLLING_LAYER_COUNT) * Math.PI * 2;
    const distance = 420 + seededUnit(index * 43 + 4) * 840;
    const radiusX = 360 + seededUnit(index * 71 + 3) * 720;
    const radiusY = 190 + seededUnit(index * 59 + 8) * 420;
    const layer = drawOrganicBlob({
      alpha: 0.1 + seededUnit(index * 67 + 12) * 0.12,
      color: index % 3 === 0 ? WORLD_FOG_COOL_COLOR : WORLD_FOG_DEEP_COLOR,
      pointCount: 28,
      radiusX,
      radiusY,
      seed: index * 97 + 21,
    });
    layer.position.set(
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance * 0.72,
    );
    layer.rotation = angle * 0.17;
    container.addChild(layer);
    motions.push(
      createFogMotion(layer, index * 37 + 5, {
        alphaPulse: 0.035,
        driftX: 28 + seededUnit(index * 19 + 1) * 42,
        driftY: -22 + seededUnit(index * 23 + 2) * 44,
        rotationDrift: 0.02,
        scalePulse: 0.018,
        speed: 0.08 + seededUnit(index * 13 + 6) * 0.07,
      }),
    );
  }

  return { container, motions };
}

function drawPeriodicTablePerimeterFog(): FogDisplay {
  const container = new Container();
  const motions: FogMotion[] = [];

  for (const [layerIndex, expansion] of WORLD_FOG_PERIMETER_EXPANSIONS.entries()) {
    const layer = new Graphics();
    const alpha = getPerimeterFogLayerAlpha(layerIndex);
    const color = layerIndex === 0 ? WORLD_FOG_DEEP_COLOR : WORLD_FOG_DARK_COLOR;

    for (const card of ELEMENT_CARDS) {
      const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP) - expansion;
      const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP) - expansion;
      layer
        .roundRect(
          x,
          y,
          CELL_WIDTH + expansion * 2,
          CELL_HEIGHT + expansion * 2,
          Math.max(12, expansion * 0.68),
        )
        .fill({ color, alpha });
    }

    container.addChild(layer);
    motions.push(
      createFogMotion(layer, expansion * 3 + 9, {
        alphaPulse: 0.025,
        driftX: 7 + layerIndex * 5,
        driftY: -5 + layerIndex * 3,
        rotationDrift: 0.002,
        scalePulse: 0.004,
        speed: 0.12 + layerIndex * 0.035,
      }),
    );
  }

  const perimeterWisps = drawPerimeterWisps();
  container.addChild(perimeterWisps.container);
  motions.push(...perimeterWisps.motions);

  return { container, motions };
}

function drawPerimeterWisps(): FogDisplay {
  const container = new Container();
  const motions: FogMotion[] = [];

  for (const [index, card] of ELEMENT_CARDS.entries()) {
    if (index % 4 !== 0) continue;
    const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
    const y =
      TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP) + CELL_HEIGHT / 2;
    const side = index % 8 < 4 ? -1 : 1;
    const wisp = drawOrganicBlob({
      alpha: 0.16 + seededUnit(index * 17 + 2) * 0.1,
      color: index % 12 === 0 ? WORLD_FOG_MIST_COLOR : WORLD_FOG_DEEP_COLOR,
      pointCount: 18,
      radiusX: 42 + seededUnit(index * 31 + 5) * 54,
      radiusY: 24 + seededUnit(index * 29 + 7) * 38,
      seed: index * 61 + 14,
    });
    wisp.position.set(x + side * (52 + seededUnit(index * 11 + 1) * 42), y - 18);
    wisp.rotation = seededUnit(index * 47 + 9) * Math.PI;
    container.addChild(wisp);
    motions.push(
      createFogMotion(wisp, index * 53 + 17, {
        alphaPulse: 0.045,
        driftX: side * (8 + seededUnit(index * 19 + 3) * 12),
        driftY: 5 + seededUnit(index * 23 + 4) * 12,
        rotationDrift: 0.035,
        scalePulse: 0.025,
        speed: 0.1 + seededUnit(index * 13 + 6) * 0.08,
      }),
    );
  }

  return { container, motions };
}

function getPerimeterFogLayerAlpha(layerIndex: number): number {
  if (layerIndex === 0) return 0.16;
  if (layerIndex === 1) return 0.24;
  return 0.33;
}

function getCellFogPuffColor(puffIndex: number): number {
  if (puffIndex === 0) return CELL_FOG_LIGHT_COLOR;
  if (puffIndex === 1) return CELL_FOG_SHADOW_COLOR;
  return CELL_FOG_DEEP_COLOR;
}

function drawElementCell(
  card: (typeof ELEMENT_CARDS)[number],
  access: PeriodicElementAccess,
): Container {
  const cell = new Container();
  const familyColor = hexToNumber(card.visual.familyColor);
  const background = new Graphics()
    .roundRect(0, 0, CELL_WIDTH, CELL_HEIGHT, 3)
    .fill(0xeeeeee)
    .stroke({ color: 0x888888, width: 1 });
  const familyBand = new Graphics().roundRect(2, 2, CELL_WIDTH - 4, 5, 2).fill(familyColor);

  const atomicNumber = new Text({
    text: card.element.atomicNumber.toString(),
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 8,
      fontWeight: "700",
      fill: 0x111111,
    },
  });
  atomicNumber.position.set(4, 8);

  const symbol = new Text({
    text: card.symbol,
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 21,
      fontWeight: "700",
      fill: 0x111111,
    },
  });
  symbol.anchor.set(0.5, 0);
  symbol.position.set(CELL_WIDTH / 2, 17);

  const name = new Text({
    text: card.name,
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 6.5,
      fill: 0x222222,
    },
  });
  name.anchor.set(0.5, 0);
  name.position.set(CELL_WIDTH / 2, 40);

  const mass = new Text({
    text: card.element.atomicMass,
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 5.5,
      fill: 0x333333,
    },
  });
  mass.anchor.set(0.5, 0);
  mass.position.set(CELL_WIDTH / 2, 50);

  cell.addChild(background, familyBand, atomicNumber, symbol, name, mass);

  if (access.discovered) {
    cell.addChild(drawQuantityBadge(access.quantity));
    if (access.quantity <= 0) cell.addChild(drawEmptyQuantityOverlay());
  }

  return cell;
}

function drawQuantityBadge(quantity: number): Container {
  const badge = new Container();
  const active = quantity > 0;
  const background = new Graphics()
    .roundRect(0, 0, 20, 12, 6)
    .fill({ color: active ? 0x0f172a : 0xffffff, alpha: active ? 0.92 : 0.8 })
    .stroke({ color: active ? 0xffffff : 0x94a3b8, width: 1, alpha: 0.85 });
  const label = new Text({
    text: `x${Math.min(quantity, 99)}`,
    resolution: TEXT_RESOLUTION,
    roundPixels: true,
    style: {
      fontFamily: PERIODIC_TABLE_FONT_FAMILY,
      fontSize: 6.5,
      fontWeight: "700",
      fill: active ? 0xffffff : 0x334155,
    },
  });
  label.anchor.set(0.5, 0.5);
  label.position.set(10, 6);
  badge.position.set(CELL_WIDTH - 22, 2);
  badge.addChild(background, label);
  return badge;
}

function drawEmptyQuantityOverlay(): Graphics {
  return new Graphics()
    .roundRect(0, 0, CELL_WIDTH, CELL_HEIGHT, 3)
    .fill({ color: 0xffffff, alpha: 0.42 })
    .stroke({ color: 0x64748b, width: 1.25, alpha: 0.72 });
}

function drawFogLayer(elementAccess: ReadonlyMap<string, PeriodicElementAccess>): FogDisplay {
  const container = new Container();
  const motions: FogMotion[] = [];

  for (const [index, card] of ELEMENT_CARDS.entries()) {
    if (getElementAccess(card, elementAccess).discovered) continue;
    const cellFog = drawElementFog(card, index);

    container.addChild(cellFog.container);
    motions.push(...cellFog.motions);
  }

  return { container, motions };
}

function drawElementFog(card: PeriodicElementCard, index: number): FogDisplay {
  const container = new Container();
  const motions: FogMotion[] = [];
  const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
  const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);
  const veil = new Graphics()
    .roundRect(x - 1, y - 1, CELL_WIDTH + 2, CELL_HEIGHT + 2, 7)
    .fill({ color: CELL_FOG_MID_COLOR, alpha: 0.72 })
    .stroke({ color: CELL_FOG_SHADOW_COLOR, width: 1.2, alpha: 0.72 });
  container.addChild(veil);

  for (let puffIndex = 0; puffIndex < CELL_FOG_PUFFS; puffIndex += 1) {
    const seed = index * 101 + puffIndex * 29;
    const puff = drawOrganicBlob({
      alpha: puffIndex === 0 ? 0.54 : 0.38,
      color: getCellFogPuffColor(puffIndex),
      pointCount: 14,
      radiusX: 19 + seededUnit(seed + 1) * 13,
      radiusY: 13 + seededUnit(seed + 2) * 11,
      seed,
    });
    puff.position.set(
      x + CELL_WIDTH * (0.34 + seededUnit(seed + 3) * 0.34),
      y + CELL_HEIGHT * (0.34 + seededUnit(seed + 4) * 0.32),
    );
    puff.rotation = seededUnit(seed + 5) * Math.PI;
    container.addChild(puff);
    motions.push(
      createFogMotion(puff, seed + 6, {
        alphaPulse: 0.035,
        driftX: -2 + seededUnit(seed + 7) * 4,
        driftY: -2 + seededUnit(seed + 8) * 4,
        rotationDrift: 0.035,
        scalePulse: 0.04,
        speed: 0.12 + seededUnit(seed + 9) * 0.08,
      }),
    );
  }

  motions.push(
    createFogMotion(veil, index * 47 + 10, {
      alphaPulse: 0.03,
      driftX: 0.7,
      driftY: -0.5,
      rotationDrift: 0,
      scalePulse: 0.006,
      speed: 0.1,
    }),
  );

  return { container, motions };
}

function drawOrganicBlob(options: {
  alpha: number;
  color: number;
  pointCount: number;
  radiusX: number;
  radiusY: number;
  seed: number;
}): Graphics {
  const points: number[] = [];

  for (let index = 0; index < options.pointCount; index += 1) {
    const angle = (index / options.pointCount) * Math.PI * 2;
    const broad = Math.sin(angle * 2 + seededUnit(options.seed + 11) * Math.PI * 2) * 0.08;
    const folded = Math.sin(angle * 5 + seededUnit(options.seed + index * 13) * Math.PI) * 0.045;
    const wobble = 0.88 + seededUnit(options.seed + index * 31) * 0.18 + broad + folded;

    points.push(Math.cos(angle) * options.radiusX * wobble);
    points.push(Math.sin(angle) * options.radiusY * wobble);
  }

  return new Graphics().poly(points).fill({ color: options.color, alpha: options.alpha });
}

function createFogMotion(
  target: FogMotionTarget,
  seed: number,
  options: FogMotionOptions = {},
): FogMotion {
  return {
    alphaPulse: options.alphaPulse ?? 0.04,
    baseAlpha: target.alpha,
    baseRotation: target.rotation,
    baseScaleX: target.scale.x,
    baseScaleY: target.scale.y,
    baseX: target.x,
    baseY: target.y,
    driftX: options.driftX ?? 8,
    driftY: options.driftY ?? -5,
    phase: seededUnit(seed) * Math.PI * 2,
    rotationDrift: options.rotationDrift ?? 0.02,
    scalePulse: options.scalePulse ?? 0.02,
    speed: options.speed ?? 0.12,
    target,
  };
}

function updateFogMotions(motions: readonly FogMotion[], timeSeconds: number): void {
  for (const motion of motions) {
    const primary = Math.sin(timeSeconds * motion.speed + motion.phase);
    const secondary = Math.sin(timeSeconds * motion.speed * 0.47 + motion.phase * 1.9);
    const targetX = motion.baseX + primary * motion.driftX + secondary * motion.driftX * 0.32;
    const targetY = motion.baseY + secondary * motion.driftY + primary * motion.driftY * 0.26;
    const scaleX = motion.baseScaleX * (1 + primary * motion.scalePulse);
    const scaleY = motion.baseScaleY * (1 + secondary * motion.scalePulse * 0.78);

    motion.target.position.set(targetX, targetY);
    motion.target.scale.set(scaleX, scaleY);
    motion.target.rotation =
      motion.baseRotation + primary * motion.rotationDrift + secondary * motion.rotationDrift * 0.4;
    motion.target.alpha = clamp(
      motion.baseAlpha + primary * motion.alphaPulse + secondary * motion.alphaPulse * 0.38,
      0,
      1,
    );
  }
}

function createElementAccess(
  options: PeriodicTableSceneOptions,
): ReadonlyMap<string, PeriodicElementAccess> {
  const discoveredElementIds = new Set(options.discoveredElementIds ?? []);
  const elementQuantities = options.elementQuantities ?? {};
  return new Map(
    ELEMENT_CARDS.map((card) => [
      card.id,
      {
        discovered: discoveredElementIds.has(card.id),
        quantity: Math.max(0, elementQuantities[card.id] ?? 0),
      },
    ]),
  );
}

function getElementAccess(
  card: PeriodicElementCard,
  elementAccess: ReadonlyMap<string, PeriodicElementAccess>,
): PeriodicElementAccess {
  return elementAccess.get(card.id) ?? { discovered: false, quantity: 0 };
}

function isElementSelectable(
  card: PeriodicElementCard,
  elementAccess: ReadonlyMap<string, PeriodicElementAccess>,
): boolean {
  const access = getElementAccess(card, elementAccess);
  return access.discovered && access.quantity > 0;
}

function getPointerPair(pointers: Map<number, ScreenPoint>): PointPair | null {
  if (pointers.size < 2) return null;

  let first: ScreenPoint | null = null;
  let second: ScreenPoint | null = null;

  for (const pointer of pointers.values()) {
    if (!first) {
      first = pointer;
      continue;
    }
    second = pointer;
    break;
  }

  return first && second ? [first, second] : null;
}

function distanceBetween(pair: PointPair): number {
  return Math.hypot(pair[1].x - pair[0].x, pair[1].y - pair[0].y);
}

function midpointBetween(pair: PointPair): ScreenPoint {
  return {
    id: -1,
    x: (pair[0].x + pair[1].x) / 2,
    y: (pair[0].y + pair[1].y) / 2,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hexToNumber(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
}
