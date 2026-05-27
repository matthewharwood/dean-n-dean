import type { Application } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const GRID_EXTENT = 3600;
const DOT_SPACING = 44;
const DOT_RADIUS = 1.35;
const MIN_SCALE = 0.35;
const MAX_SCALE = 3;
const PRIMARY_POINTER_BUTTON = 0;
const MIDDLE_POINTER_BUTTON = 1;

type ExpeditionCanvasSceneOptions = {
  getFitRect?: () => DOMRect | null;
  getInteractionRect?: () => DOMRect | null;
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

type ViewRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export function setupExpeditionCanvasScene(
  app: Application,
  options: ExpeditionCanvasSceneOptions = {},
): () => void {
  const worldLayer = new Container();
  const state: InteractionState = { pointers: new Map() };
  const canvas = app.canvas;
  const resizeTarget = canvas.parentElement ?? canvas;
  let disposed = false;
  let resizeFrame = 0;
  let hasInteracted = false;

  worldLayer.addChild(drawDottedWorld());
  app.stage.addChild(worldLayer);

  const renderNow = () => {
    if (!disposed) app.render();
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

  const centerWorld = () => {
    if (disposed || hasInteracted) return;

    const fitRect = getCanvasLocalFitRect();
    worldLayer.scale.set(1);
    worldLayer.position.set(fitRect.left + fitRect.width / 2, fitRect.top + fitRect.height / 2);
    renderNow();
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
    const currentScale = worldLayer.scale.x;
    const worldX = (screenX - worldLayer.x) / currentScale;
    const worldY = (screenY - worldLayer.y) / currentScale;
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    worldLayer.scale.set(clampedScale);
    worldLayer.position.set(screenX - worldX * clampedScale, screenY - worldY * clampedScale);
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

  const beginPan = (event: PointerEvent, point: ScreenPoint) => {
    hasInteracted = true;
    canvas.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, point);
    canvas.style.cursor = "grabbing";
  };

  const handleWheel = (event: WheelEvent) => {
    if (disposed || !isInInteractionRect(event)) return;
    event.preventDefault();
    hasInteracted = true;
    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const wheelScale = Math.exp(-event.deltaY * 0.001);

    zoomAt(pointerX, pointerY, worldLayer.scale.x * wheelScale);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (disposed || !isInInteractionRect(event)) return;
    if (event.button !== PRIMARY_POINTER_BUTTON && event.button !== MIDDLE_POINTER_BUTTON) return;

    event.preventDefault();
    beginPan(event, getScreenPoint(event));
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
          worldLayer.scale.x * (afterDistance / beforeDistance),
        );
        worldLayer.position.set(
          worldLayer.x + afterCenter.x - beforeCenter.x,
          worldLayer.y + afterCenter.y - beforeCenter.y,
        );
        renderNow();
      }
      return;
    }

    worldLayer.position.set(worldLayer.x + next.x - previous.x, worldLayer.y + next.y - previous.y);
    renderNow();
  };

  const handlePointerUp = (event: PointerEvent) => {
    state.pointers.delete(event.pointerId);
    if (state.pointers.size === 0) canvas.style.cursor = "grab";
  };

  const queueResize = () => {
    if (resizeFrame !== 0) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      centerWorld();
      renderNow();
    });
  };

  canvas.style.cursor = "grab";
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  const resizeObserver = new ResizeObserver(queueResize);
  resizeObserver.observe(resizeTarget);
  centerWorld();

  return () => {
    disposed = true;
    if (resizeFrame !== 0) cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
    canvas.style.cursor = "";
    canvas.removeEventListener("wheel", handleWheel);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerUp);
  };
}

function drawDottedWorld(): Graphics {
  const grid = new Graphics();

  for (let x = -GRID_EXTENT; x <= GRID_EXTENT; x += DOT_SPACING) {
    for (let y = -GRID_EXTENT; y <= GRID_EXTENT; y += DOT_SPACING) {
      grid.circle(x, y, DOT_RADIUS);
    }
  }

  return grid.fill({ color: 0x0f172a, alpha: 0.24 });
}

function getPointerPair(pointers: ReadonlyMap<number, ScreenPoint>): PointPair | null {
  if (pointers.size < 2) return null;

  const points = [...pointers.values()];
  const first = points[0];
  const second = points[1];
  if (!first || !second) return null;

  return [first, second];
}

function distanceBetween([first, second]: PointPair): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function midpointBetween([first, second]: PointPair): ScreenPoint {
  return {
    id: first.id,
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
