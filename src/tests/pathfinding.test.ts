import { buildGraph, getIncomingLinks, getOutgoingLinks } from "../pathfinding";
describe("in empty room", () => {
  const g = buildGraph({ x: 0, y: 0, width: 1000, height: 500 }, [], {
    stepX: 10,
    stepY: 20,
    jumpDeltas: [-4, -3, -2, -1, 0, 0, 1, -2, -3, -4],
    unitHeight: 10,
    unitWidth: 20,
  });

  it.each([
    ["10_10_0", 3],
    ["10_10_1", 3],
    ["10_10_8", 3],
    ["10_10_9", 3],
  ])("%i has %i outgoing links", (node, expected) => {
    expect(getOutgoingLinks(g, node)).toHaveLength(expected);
  });

  it.each([
    ["10_10_0", 0],
    ["10_10_1", 3],
    ["10_10_8", 3],
    ["10_10_9", 6],
  ])("%i has %i incoming links", (node, expected) => {
    expect(getIncomingLinks(g, node)).toHaveLength(expected);
  });
});

describe("with 3 platforms", () => {
  const platforms = [
    {
      x: 0,
      y: 536,
      width: 800,
      height: 64,
    },
    {
      x: 400,
      y: 384,
      width: 400,
      height: 32,
    },
    {
      x: -150,
      y: 234,
      width: 400,
      height: 32,
    },
    {
      x: 550,
      y: 204,
      width: 400,
      height: 32,
    },
  ];
  const g = buildGraph({ x: 0, y: 0, width: 800, height: 600 }, platforms, {
    jumpDeltas: [-2, -1, -1, 0, 0, 1, 1, 2],
    stepX: 10,
    stepY: 20,
    unitHeight: 20,
    unitWidth: 20,
  });
  it("should not be empty", () => {
    expect(getOutgoingLinks(g, '60_15_0')).toHaveLength(3);
  });
});
