import { type AlchemistGuildElementQuantities, ELEMENT_CARDS } from "@dean-stack/schemas";
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
const CARD_BACK_BASE_COLOR = 0x991b1b;
const CARD_BACK_DARK_COLOR = 0x450a0a;
const CARD_BACK_INK_COLOR = 0xfff7ed;
const CARD_BACK_ACCENT_COLOR = 0x1e3a8a;
const CARD_BACK_LINE_COLOR = 0xfecaca;
const CARD_BACK_PATTERN_INSET = 6;
const CARD_BACK_PATTERN_STEP = 8;
const CARD_BACK_PATTERN_RADIUS_X = 2.3;
const CARD_BACK_PATTERN_RADIUS_Y = 3.3;
const EMPTY_CARD_CROSS_COLOR = 0x334155;
const ELEMENT_REVEAL_STAGGER_MS = 92;
const ELEMENT_REVEAL_DURATION_MS = 560;
const ELEMENT_REVEAL_START_SCALE_X = 0.04;
const ELEMENT_REVEAL_START_SKEW_Y = -0.42;
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
  cameraMode?: PeriodicTableCameraMode;
  cameraTransition?: PeriodicTableCameraTransition;
  discoveredElementIds?: readonly string[];
  elementQuantities?: Readonly<AlchemistGuildElementQuantities>;
  getFitRect?: () => DOMRect | null;
  getInteractionRect?: () => DOMRect | null;
  onElementGrab?: (grab: PeriodicTableElementGrab) => void;
  reducedMotion?: boolean;
  revealElementIds?: readonly string[];
};

type PeriodicTableCameraMode =
  | { kind: "element"; elementId: string; scale?: number }
  | { kind: "fit" };

type PeriodicTableCameraTransition = "intro-zoom-out" | "none";

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

type RevealedElementCell = {
  cell: Container;
  order: number;
};

type CameraState = {
  scale: number;
  x: number;
  y: number;
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
  const elementAccess = createElementAccess(options);
  const state: InteractionState = { pointers: new Map() };
  const canvas = app.canvas;
  const resizeTarget = canvas.parentElement ?? canvas;
  let disposed = false;
  let resizeFrame = 0;
  let cameraAnimationFrame = 0;
  let cameraTransitionComplete = false;
  let cancelRevealAnimation: (() => void) | null = null;

  app.stage.addChild(tableLayer);

  const renderNow = () => {
    if (disposed) return;
    app.render();
  };

  const revealedCells = drawPeriodicTable(
    tableLayer,
    elementAccess,
    new Set(options.revealElementIds ?? []),
  );

  const applyCameraState = (camera: CameraState) => {
    tableLayer.scale.set(camera.scale);
    tableLayer.position.set(camera.x, camera.y);
  };

  const getFitCameraState = (): CameraState => {
    const fitRect = getCanvasLocalFitRect();
    const availableWidth = Math.max(fitRect.width - FIT_PADDING * 2, tableWidth * MIN_SCALE);
    const availableHeight = Math.max(fitRect.height - FIT_PADDING * 2, tableHeight * MIN_SCALE);
    const scale = Math.min(availableWidth / tableWidth, availableHeight / tableHeight, 1);
    const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);

    return {
      scale: nextScale,
      x: fitRect.left + (fitRect.width - tableWidth * nextScale) / 2,
      y: fitRect.top + (fitRect.height - tableHeight * nextScale) / 2,
    };
  };

  const getElementFocusCameraState = (
    elementId: string,
    preferredScale: number | undefined,
  ): CameraState => {
    const card = ELEMENT_CARDS.find((elementCard) => elementCard.id === elementId);
    if (!card) return getFitCameraState();

    const fitRect = getCanvasLocalFitRect();
    const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
    const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);
    const centerX = x + CELL_WIDTH / 2;
    const centerY = y + CELL_HEIGHT / 2;
    const scale = clamp(preferredScale ?? MAX_SCALE, MIN_SCALE, MAX_SCALE);

    return {
      scale,
      x: fitRect.left + fitRect.width / 2 - centerX * scale,
      y: fitRect.top + fitRect.height / 2 - centerY * scale,
    };
  };

  const getCameraState = (mode: PeriodicTableCameraMode): CameraState => {
    if (mode.kind === "element") return getElementFocusCameraState(mode.elementId, mode.scale);
    return getFitCameraState();
  };

  const getCurrentCameraMode = (): PeriodicTableCameraMode => {
    if (options.cameraTransition === "intro-zoom-out" && cameraTransitionComplete) {
      return { kind: "fit" };
    }

    return options.cameraMode ?? { kind: "fit" };
  };

  const syncCamera = () => {
    if (disposed || cameraAnimationFrame !== 0) return;
    applyCameraState(getCameraState(getCurrentCameraMode()));
  };

  const cancelCameraAnimation = () => {
    if (cameraAnimationFrame === 0) return;
    cancelAnimationFrame(cameraAnimationFrame);
    cameraAnimationFrame = 0;
  };

  const startIntroZoomOut = () => {
    if (disposed) return;

    const startCamera = getCameraState(options.cameraMode ?? { kind: "fit" });
    const endCamera = getFitCameraState();
    if (options.reducedMotion === true) {
      cameraTransitionComplete = true;
      applyCameraState(endCamera);
      renderNow();
      return;
    }

    const startedAtMs = performance.now();
    const durationMs = 1080;
    applyCameraState(startCamera);
    renderNow();

    const tick = (nowMs: number) => {
      const progress = clamp((nowMs - startedAtMs) / durationMs, 0, 1);
      const eased = easeInOutCubic(progress);

      applyCameraState({
        scale: lerp(startCamera.scale, endCamera.scale, eased),
        x: lerp(startCamera.x, endCamera.x, eased),
        y: lerp(startCamera.y, endCamera.y, eased),
      });
      renderNow();

      if (progress < 1) {
        cameraAnimationFrame = requestAnimationFrame(tick);
        return;
      }

      cameraAnimationFrame = 0;
      cameraTransitionComplete = true;
      applyCameraState(endCamera);
      renderNow();
    };

    cameraAnimationFrame = requestAnimationFrame(tick);
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
    cancelCameraAnimation();
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
    cancelCameraAnimation();
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
      syncCamera();
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
  if (options.cameraTransition === "intro-zoom-out") {
    startIntroZoomOut();
  } else {
    handleResize();
  }
  cancelRevealAnimation = startElementRevealAnimation(
    revealedCells,
    renderNow,
    options.reducedMotion === true,
  );
  void document.fonts?.ready.then(renderNow);

  return () => {
    disposed = true;
    if (resizeFrame !== 0) cancelAnimationFrame(resizeFrame);
    cancelCameraAnimation();
    cancelRevealAnimation?.();
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
  revealElementIds: ReadonlySet<string>,
): RevealedElementCell[] {
  const revealedCells: RevealedElementCell[] = [];
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
    const access = getElementAccess(card, elementAccess);
    const cell = drawElementCell(card, access);
    const x = (card.element.table.column - 1) * (CELL_WIDTH + CELL_GAP);
    const y = TITLE_HEIGHT + (card.element.table.row - 1) * (CELL_HEIGHT + CELL_GAP);

    if (access.discovered && revealElementIds.has(card.id)) {
      cell.pivot.set(CELL_WIDTH / 2, CELL_HEIGHT / 2);
      cell.position.set(x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
      cell.scale.set(ELEMENT_REVEAL_START_SCALE_X, 0.94);
      cell.skew.set(0, ELEMENT_REVEAL_START_SKEW_Y);
      cell.alpha = 0;
      revealedCells.push({ cell, order: revealedCells.length });
    } else {
      cell.position.set(x, y);
    }

    tableLayer.addChild(cell);
  }

  return revealedCells;
}

function drawElementCell(
  card: (typeof ELEMENT_CARDS)[number],
  access: PeriodicElementAccess,
): Container {
  const cell = new Container();

  if (!access.discovered) {
    cell.addChild(drawElementCardBack());
    return cell;
  }

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

  if (access.quantity <= 0) cell.addChild(drawEmptyQuantityOverlay());
  cell.addChild(drawQuantityBadge(access.quantity));

  return cell;
}

function drawElementCardBack(): Container {
  const back = new Container();
  const base = new Graphics()
    .roundRect(0, 0, CELL_WIDTH, CELL_HEIGHT, 4)
    .fill(CARD_BACK_BASE_COLOR)
    .stroke({ color: CARD_BACK_DARK_COLOR, width: 1.2 })
    .roundRect(3, 3, CELL_WIDTH - 6, CELL_HEIGHT - 6, 3)
    .stroke({ color: CARD_BACK_INK_COLOR, width: 1, alpha: 0.86 })
    .roundRect(6, 6, CELL_WIDTH - 12, CELL_HEIGHT - 12, 2)
    .stroke({ color: CARD_BACK_LINE_COLOR, width: 0.7, alpha: 0.55 });

  back.addChild(base, drawCardBackLattice(), drawCardBackDiamonds(), drawCardBackMedallion());
  return back;
}

function drawCardBackLattice(): Graphics {
  const lattice = new Graphics();
  const left = CARD_BACK_PATTERN_INSET;
  const top = CARD_BACK_PATTERN_INSET;
  const right = CELL_WIDTH - CARD_BACK_PATTERN_INSET;
  const bottom = CELL_HEIGHT - CARD_BACK_PATTERN_INSET;
  const patternWidth = right - left;
  const patternHeight = bottom - top;

  for (let startX = left; startX <= right; startX += CARD_BACK_PATTERN_STEP) {
    const run = Math.min(patternHeight, right - startX);
    strokeCardBackPatternLine(lattice, startX, top, startX + run, top + run, 0.24);
    strokeCardBackPatternLine(lattice, startX, bottom, startX + run, bottom - run, 0.2);
  }

  for (
    let startY = top + CARD_BACK_PATTERN_STEP;
    startY < bottom;
    startY += CARD_BACK_PATTERN_STEP
  ) {
    const run = Math.min(patternWidth, bottom - startY);
    strokeCardBackPatternLine(lattice, left, startY, left + run, startY + run, 0.24);
  }

  for (
    let startY = bottom - CARD_BACK_PATTERN_STEP;
    startY > top;
    startY -= CARD_BACK_PATTERN_STEP
  ) {
    const run = Math.min(patternWidth, startY - top);
    strokeCardBackPatternLine(lattice, left, startY, left + run, startY - run, 0.2);
  }

  lattice
    .rect(left, top, right - left, bottom - top)
    .stroke({ color: CARD_BACK_ACCENT_COLOR, width: 0.7, alpha: 0.62 });

  return lattice;
}

function strokeCardBackPatternLine(
  graphics: Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  alpha: number,
): void {
  graphics
    .moveTo(startX, startY)
    .lineTo(endX, endY)
    .stroke({ color: CARD_BACK_INK_COLOR, width: 0.45, alpha });
}

function drawCardBackDiamonds(): Graphics {
  const diamonds = new Graphics();
  let row = 0;

  for (
    let y = CARD_BACK_PATTERN_INSET + 4;
    y <= CELL_HEIGHT - CARD_BACK_PATTERN_INSET - 2;
    y += CARD_BACK_PATTERN_STEP
  ) {
    const xOffset = row % 2 === 0 ? 0 : CARD_BACK_PATTERN_STEP / 2;
    for (
      let x = CARD_BACK_PATTERN_INSET + 4 + xOffset;
      x <= CELL_WIDTH - CARD_BACK_PATTERN_INSET - 2;
      x += CARD_BACK_PATTERN_STEP
    ) {
      drawDiamond(
        diamonds,
        x,
        y,
        CARD_BACK_PATTERN_RADIUS_X,
        CARD_BACK_PATTERN_RADIUS_Y,
        CARD_BACK_INK_COLOR,
        0.36,
      );
      drawDiamond(diamonds, x, y, 1, 1.45, CARD_BACK_ACCENT_COLOR, 0.5);
    }
    row += 1;
  }

  return diamonds;
}

function drawCardBackMedallion(): Graphics {
  const centerX = CELL_WIDTH / 2;
  const centerY = CELL_HEIGHT / 2;
  const medallion = new Graphics()
    .ellipse(centerX, centerY, 10.5, 15)
    .fill({ color: CARD_BACK_DARK_COLOR, alpha: 0.32 })
    .stroke({ color: CARD_BACK_INK_COLOR, width: 0.8, alpha: 0.84 })
    .ellipse(centerX, centerY, 6.5, 10)
    .stroke({ color: CARD_BACK_LINE_COLOR, width: 0.65, alpha: 0.78 });

  drawDiamond(medallion, centerX, centerY - 4.5, 3.2, 4.8, CARD_BACK_INK_COLOR, 0.7);
  drawDiamond(medallion, centerX, centerY + 4.5, 3.2, 4.8, CARD_BACK_INK_COLOR, 0.7);
  medallion
    .circle(centerX, centerY, 2.15)
    .fill({ color: CARD_BACK_ACCENT_COLOR, alpha: 0.82 })
    .circle(centerX, centerY, 0.8)
    .fill({ color: CARD_BACK_INK_COLOR, alpha: 0.95 });

  return medallion;
}

function drawDiamond(
  graphics: Graphics,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: number,
  alpha: number,
): void {
  graphics
    .poly(
      [
        centerX,
        centerY - radiusY,
        centerX + radiusX,
        centerY,
        centerX,
        centerY + radiusY,
        centerX - radiusX,
        centerY,
      ],
      true,
    )
    .fill({ color, alpha });
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
  const overlay = new Graphics()
    .roundRect(0, 0, CELL_WIDTH, CELL_HEIGHT, 3)
    .fill({ color: 0xffffff, alpha: 0.18 })
    .stroke({ color: EMPTY_CARD_CROSS_COLOR, width: 1, alpha: 0.58 });

  overlay
    .moveTo(7, 8)
    .lineTo(CELL_WIDTH - 7, CELL_HEIGHT - 8)
    .stroke({ color: EMPTY_CARD_CROSS_COLOR, width: 1.6, alpha: 0.54, cap: "round" });
  overlay
    .moveTo(CELL_WIDTH - 7, 8)
    .lineTo(7, CELL_HEIGHT - 8)
    .stroke({ color: EMPTY_CARD_CROSS_COLOR, width: 1.6, alpha: 0.46, cap: "round" });

  return overlay;
}

function startElementRevealAnimation(
  revealedCells: readonly RevealedElementCell[],
  renderNow: () => void,
  reducedMotion: boolean,
): () => void {
  if (revealedCells.length === 0) return noopRevealAnimationCleanup;

  const finish = () => {
    for (const { cell } of revealedCells) {
      cell.alpha = 1;
      cell.scale.set(1);
      cell.skew.set(0, 0);
    }
    renderNow();
  };

  if (reducedMotion || typeof window === "undefined") {
    finish();
    return noopRevealAnimationCleanup;
  }

  let animationFrame = 0;
  const startedAtMs = performance.now();
  const totalDurationMs =
    (revealedCells.length - 1) * ELEMENT_REVEAL_STAGGER_MS + ELEMENT_REVEAL_DURATION_MS;

  const tick = (nowMs: number) => {
    const elapsedMs = nowMs - startedAtMs;

    for (const { cell, order } of revealedCells) {
      const delayedElapsedMs = elapsedMs - order * ELEMENT_REVEAL_STAGGER_MS;
      const progress = clamp(delayedElapsedMs / ELEMENT_REVEAL_DURATION_MS, 0, 1);
      const eased = easeOutBack(progress);
      const opacityEase = easeOutCubic(progress);

      cell.alpha = opacityEase;
      cell.scale.set(
        ELEMENT_REVEAL_START_SCALE_X + (1 - ELEMENT_REVEAL_START_SCALE_X) * eased,
        0.94 + 0.06 * opacityEase,
      );
      cell.skew.set(0, ELEMENT_REVEAL_START_SKEW_Y * (1 - opacityEase));
    }

    renderNow();
    if (elapsedMs < totalDurationMs) {
      animationFrame = requestAnimationFrame(tick);
      return;
    }

    animationFrame = 0;
    finish();
  };

  animationFrame = requestAnimationFrame(tick);

  return () => {
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    finish();
  };
}

function noopRevealAnimationCleanup(): void {
  return;
}

function easeOutCubic(progress: number): number {
  const inverted = 1 - progress;
  return 1 - inverted * inverted * inverted;
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;
}

function easeOutBack(progress: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const shifted = progress - 1;
  return 1 + c3 * shifted * shifted * shifted + c1 * shifted * shifted;
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

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function hexToNumber(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}
