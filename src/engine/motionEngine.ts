/**
 * Capture current positions of all nodes in SVG world space.
 * Using world space prevents camera movement (pan/zoom) from affecting the calculation.
 */
export const capturePositions = (): Map<string, { x: number, y: number }> => {
  const positions = new Map<string, { x: number, y: number }>();
  const nodes = document.querySelectorAll('[id^="node-group-"]');
  const worldGroup = document.getElementById("canvas-world-group") as unknown as SVGGElement | null;
  const svg = worldGroup?.ownerSVGElement;

  if (!worldGroup || !svg) return positions;

  const ctm = worldGroup.getScreenCTM();
  if (!ctm) return positions;
  const inv = ctm.inverse();

  nodes.forEach((node) => {
    const id = node.id.replace("node-group-", "");
    const rect = node.getBoundingClientRect();

    // Map viewport center of node to world space
    const pt = svg.createSVGPoint();
    pt.x = rect.left;
    pt.y = rect.top;
    const worldPt = pt.matrixTransform(inv);

    positions.set(id, { x: worldPt.x, y: worldPt.y });
  });

  return positions;
};

/**
 * Animate from old positions to current positions using SVG deltas.
 */
export const animateTransitions = async (oldPositions: Map<string, { x: number, y: number }>) => {
  const nodes = document.querySelectorAll('[id^="node-group-"]');
  const worldGroup = document.getElementById("canvas-world-group") as unknown as SVGGElement | null;
  const svg = worldGroup?.ownerSVGElement;

  if (!worldGroup || !svg) return;

  const ctm = worldGroup.getScreenCTM();
  if (!ctm) return;
  const inv = ctm.inverse();

  const animations: Promise<void>[] = [];

  nodes.forEach((node) => {
    const htmlNode = node as HTMLElement;
    const id = htmlNode.id.replace("node-group-", "");
    const oldPos = oldPositions.get(id);

    if (!oldPos) return;

    const rect = htmlNode.getBoundingClientRect();
    const pt = svg.createSVGPoint();
    pt.x = rect.left;
    pt.y = rect.top;
    const newPos = pt.matrixTransform(inv);

    // Calculate delta in SVG units
    const dx = oldPos.x - newPos.x;
    const dy = oldPos.y - newPos.y;

    // Only animate if there's significant movement (> 0.1 SVG units)
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;

    const animation = htmlNode.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );

    animations.push(new Promise((resolve) => {
      animation.onfinish = () => {
        htmlNode.style.transform = ''; // Clear CSS transform
        resolve();
      };
    }));
  });

  await Promise.all(animations);
};

/**
 * High-level wrapper to animate a state transition.
 */
export const performAnimatedLayoutChange = async (
  action: () => void | Promise<void>,
  onStart?: () => void,
  onEnd?: () => void
) => {
  onStart?.();
  try {
    const oldPositions = capturePositions();

    // Perform the state update
    await action();

    // Wait a double frame to ensure React has fully committed the new positions to the DOM
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await animateTransitions(oldPositions);
          resolve();
        });
      });
    });
  } catch (err) {
    console.error("[MotionEngine] Layout animation failed:", err);
    throw err;
  } finally {
    onEnd?.();
  }
};
