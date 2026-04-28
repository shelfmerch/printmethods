/**
 * Geometric transformation utilities.
 * Pure utilities — no React dependency.
 */

/** Calculate the axis-aligned bounding box of a rotated rectangle. */
export const calculateRotatedBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // 4 corners relative to (x,y)
  // (0,0), (w,0), (w,h), (0,h)
  // Rotate: x' = x*cos - y*sin, y' = x*sin + y*cos
  const vertices = [
    { x: 0, y: 0 },
    { x: width * cos, y: width * sin },
    { x: width * cos - height * sin, y: width * sin + height * cos },
    { x: -height * sin, y: height * cos }
  ];

  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);

  return {
    minX: Math.min(...xs) + x,
    maxX: Math.max(...xs) + x,
    minY: Math.min(...ys) + y,
    maxY: Math.max(...ys) + y,
    // Relative min/max for drag constraining
    relMinX: Math.min(...xs),
    relMaxX: Math.max(...xs),
    relMinY: Math.min(...ys),
    relMaxY: Math.max(...ys)
  };
};
