import createGraph, { Graph, NodeId } from "ngraph.graph";

enum Tile {
  Solid,
  Air,
  // Shadow,
}
type Config = {
  stepX: number;
  stepY: number;
  unitWidth: number;
  unitHeight: number;
  jumpDeltas: number[];
};
type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
function getPoints(
  r: Rect,
  dx: number,
  dy: number
): { x: number; y: number }[] {
  const points = [];
  for (let x = 0; x < r.width; x += dx) {
    for (let y = 0; y < r.height; y += dy) {
      points.push({ x: r.x + x, y: r.y + y });
    }
  }
  return points;
}

const ANY_POWER = -1;

export const vert = (x: number, y: number, p: number = ANY_POWER) =>
  `${x}_${y}_${p}`;

export const devert = (nodeId: NodeId) => {
  const [i, j, p] = nodeId.toString().split("_");
  return { i: +i, j: +j, p: +p};
}

export function buildGraph(
  world: Rect,
  sortedPlatforms: Rect[],
  { stepX, stepY, jumpDeltas, unitWidth, unitHeight }: Config
) {
  const graph = createGraph<string, undefined>();
  const height = world.height / stepY;
  const width = world.width / stepX;
  const grid = Array(width)
    .fill(null)
    .map((_) =>
      Array(height)
        .fill(null)
        .map((_) => Tile.Air)
    );
  const unitGridHeight = Math.ceil(unitHeight / stepY);
  const unitGridWidth = Math.ceil(unitWidth / stepX);
  const mark = (x: number, y: number) => {
    const i = Math.floor(x / stepX);
    const j = Math.floor(y / stepY);
    if (i >= 0 && j >= 0 && i < width && j < height)
      grid[i][j] = Tile.Solid;
  };
  for (const platform of sortedPlatforms) {
    for (const point of getPoints(platform, stepX, stepY)) {
      for (let dx = 0; dx <= unitGridWidth; dx++) {
        for (let dy = 0; dy <= unitGridHeight; dy++) {
          mark(point.x - dx * stepX, point.y - dy * stepY);
        }
      }
    }
  }
  const midpointPower = Math.floor((jumpDeltas.length - 1) / 2);
  function isSolid(x: number, y: number) {
    if (x >= width || y >= height || x < 0 || y < 0) return true;
    return grid[x][y] === Tile.Solid;
  }
  function addLinkWithSink(x: number, y: number) {
    for (let p = 0; p < jumpDeltas.length; p++)
      graph.addLink(vert(x, y, p), vert(x, y, -1));
  }
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      addLinkWithSink(i, j);
      if (!isSolid(i, j)) {
        const hasGround = isSolid(i, j + 1);
        if (hasGround) {
          for (let p = 0; p < jumpDeltas.length - 1; p++) {
            graph.addLink(vert(i, j, p), vert(i, j, 0));
            for (let newX = i-1; newX <= i+1; newX += 2) {
              if (!isSolid(newX, j)) {
                graph.addLink(vert(i, j, p), vert(newX, j, midpointPower));
              }
            }
          }
        }

        for (let p = 0; p < jumpDeltas.length; p++) {
          for (let newX = i - 1; newX <= i + 1; newX++) {
            const delta = jumpDeltas[p];
            if (!isSolid(newX, j)) {
              const incr = delta > 0 ? +1 : -1;
              let newY = j;
              let newP = Math.min(p + 1, jumpDeltas.length - 1);
              for (; newY !== j + delta; newY += incr) {
                if (isSolid(newX, newY)) {
                  newP = midpointPower;
                  break;
                }
              }
              graph.addLink(vert(i, j, p), vert(newX, newY, newP));
            }
          }
        }
      }
    }
  }
  return graph;
}

export const getOutgoingLinks = (g: Graph<string, undefined>, node: string) => {
  return Array.from(g.getLinks(node) || []).filter((l) => l.fromId === node);
};
export const getIncomingLinks = (g: Graph<string, undefined>, node: string) => {
  return Array.from(g.getLinks(node) || []).filter((l) => l.toId === node);
};
