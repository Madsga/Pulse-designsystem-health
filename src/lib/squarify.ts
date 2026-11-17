export interface TreemapInput<T> {
  value: number;
  item: T;
}

export interface TreemapRect<T> {
  item: T;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk).
 * Lays items out largest first in a W×H box, keeping tiles close to square.
 */
export function squarify<T>(inputs: TreemapInput<T>[], W: number, H: number): TreemapRect<T>[] {
  if (inputs.length === 0) return [];
  const items = [...inputs].sort((a, b) => b.value - a.value);
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const scale = (W * H) / total;
  const out: TreemapRect<T>[] = [];

  const rowArea = (row: TreemapInput<T>[]) => row.reduce((sum, r) => sum + r.value, 0) * scale;
  const worst = (row: TreemapInput<T>[], side: number) => {
    const s = rowArea(row);
    return Math.max(
      ...row.map((r) => {
        const a = r.value * scale;
        return Math.max((side * side * a) / (s * s), (s * s) / (side * side * a));
      }),
    );
  };

  let x = 0;
  let y = 0;
  let w = W;
  let h = H;
  let rest = items;

  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) {
      row.push(rest[i]);
      i++;
    }
    rest = rest.slice(i);
    const area = rowArea(row);

    if (w >= h) {
      const cw = area / h;
      let cy = y;
      for (const r of row) {
        const ch = (r.value * scale) / cw;
        out.push({ item: r.item, x, y: cy, w: cw, h: ch });
        cy += ch;
      }
      x += cw;
      w -= cw;
    } else {
      const ch = area / w;
      let cx = x;
      for (const r of row) {
        const cw = (r.value * scale) / ch;
        out.push({ item: r.item, x: cx, y, w: cw, h: ch });
        cx += cw;
      }
      y += ch;
      h -= ch;
    }
  }
  return out;
}
