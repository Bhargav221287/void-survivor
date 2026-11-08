import { describe, it, expect, beforeEach } from "vitest";
import { SpatialHashGrid, SpatialEntity } from "../spatial-grid";

interface TestEntity extends SpatialEntity {
  name: string;
}

describe("SpatialHashGrid", () => {
  let grid: SpatialHashGrid<TestEntity>;

  beforeEach(() => {
    grid = new SpatialHashGrid<TestEntity>(50); // 50px cell size
  });

  it("finds nearby entities within range", () => {
    const e1: TestEntity = { id: 1, x: 10, y: 10, radius: 5, name: "Player" };
    const e2: TestEntity = { id: 2, x: 25, y: 25, radius: 5, name: "Enemy Close" };
    const e3: TestEntity = { id: 3, x: 500, y: 500, radius: 5, name: "Enemy Far" };

    grid.insert(e1);
    grid.insert(e2);
    grid.insert(e3);

    const results = grid.query(10, 10, 30);
    const ids = results.map((r) => r.id);

    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).not.toContain(3);
  });

  it("does not return duplicates even if an entity spans multiple cells", () => {
    // Entity placed directly on border of cells (0,0), (0,1), (1,0), (1,1)
    const largeEntity: TestEntity = { id: 99, x: 50, y: 50, radius: 40, name: "BigBoss" };
    grid.insert(largeEntity);

    const results = grid.query(50, 50, 45);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(99);
  });

  it("correctly clears all cells", () => {
    grid.insert({ id: 1, x: 10, y: 10, radius: 5, name: "A" });
    expect(grid.query(10, 10, 20).length).toBe(1);

    grid.clear();
    expect(grid.query(10, 10, 20).length).toBe(0);
  });

  it("accurately detects circular collisions with checkCollision", () => {
    const a: SpatialEntity = { id: "a", x: 0, y: 0, radius: 10 };
    const b: SpatialEntity = { id: "b", x: 15, y: 0, radius: 10 }; // distance 15 <= 20 -> collides
    const c: SpatialEntity = { id: "c", x: 25, y: 0, radius: 10 }; // distance 25 > 20 -> does not collide

    expect(SpatialHashGrid.checkCollision(a, b)).toBe(true);
    expect(SpatialHashGrid.checkCollision(a, c)).toBe(false);
  });

  it("calculates squared distance without sqrt overhead", () => {
    expect(SpatialHashGrid.distanceSq(0, 0, 3, 4)).toBe(25); // 3^2 + 4^2 = 25
    expect(SpatialHashGrid.distanceSq(10, 20, 10, 25)).toBe(25);
  });
});
