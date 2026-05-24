import { ELEMENT_CARDS } from "@dean-stack/schemas";
import type { Application } from "pixi.js";
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
  getInteractionRect?: () => DOMRect | null;
  onElementGrab?: (grab: PeriodicTableElementGrab) => void;
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

const tableWidth = TABLE_COLUMNS * CELL_WIDTH + (TABLE_COLUMNS - 1) * CELL_GAP;
const tableHeight = TITLE_HEIGHT + TABLE_ROWS * CELL_HEIGHT + (TABLE_ROWS - 1) * CELL_GAP;

export function setupPeriodicTableScene(
  app: Application,
  options: PeriodicTableSceneOptions = {},
): () => void {
  const tableLayer = new Container();
  const state: InteractionState = { pointers: new Map() };
  const canvas = app.canvas;
  const resizeTarget = canvas.parentElement ?? canvas;
  let disposed = false;
  let resizeFrame = 0;

  app.stage.addChild(tableLayer);
  drawPeriodicTable(tableLayer);

  const renderNow = () => {
    if (disposed) return;
    app.render();
  };

  const fitTable = () => {
    if (disposed) return;
    const fitRect = getCanvasLocalInteractionRect();
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

  const getCanvasLocalInteractionRect = (): ViewRect => {
    const interactionRect = options.getInteractionRect?.();
    if (!interactionRect || interactionRect.width <= 0 || interactionRect.height <= 0) {
      return { height: app.screen.height, left: 0, top: 0, width: app.screen.width };
    }

    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = app.screen.width / Math.max(canvasRect.width, 1);
    const scaleY = app.screen.height / Math.max(canvasRect.height, 1);

    return {
      height: interactionRect.height * scaleY,
      left: (interactionRect.left - canvasRect.left) * scaleX,
      top: (interactionRect.top - canvasRect.top) * scaleY,
      width: interactionRect.width * scaleX,
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

      return {
        card,
        grabOffsetX: (localX / CELL_WIDTH) * FLOATING_ELEMENT_CARD_WIDTH,
        grabOffsetY: (localY / CELL_HEIGHT) * FLOATING_ELEMENT_CARD_HEIGHT,
      };
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

  return () => {
    disposed = true;
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

function drawPeriodicTable(tableLayer: Container): void {
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
    const cell = drawElementCell(card);
    const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
    const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);

    cell.position.set(x, y);
    tableLayer.addChild(cell);
  }
}

function drawElementCell(card: (typeof ELEMENT_CARDS)[number]): Container {
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

  return cell;
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
