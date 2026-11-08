export interface SpatialEntity {
  id: string | number;
  x: number;
  y: number;
  radius: number;
}

/**
 * High-performance 2D Spatial Hash Grid for broad-phase collision detection.
 * Reduces pairwise collision complexity from O(N^2) to near O(N).
 */
export class SpatialHashGrid<T extends SpatialEntity> {
  private readonly cellSize: number;
  private readonly grid: Map<string, T[]>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map<string, T[]>();
  }

  /**
   * Generates a discrete cell key for coordinate pair.
   */
  private getCellKey(cellX: number, cellY: number): string {
    return `${cellX}:${cellY}`;
  }

  /**
   * Clears the spatial hash grid. Must be called once before re-populating per frame.
   */
  public clear(): void {
    this.grid.clear();
  }

  /**
   * Inserts an entity into all cells covered by its bounding circle.
   */
  public insert(entity: T): void {
    const minCellX = Math.floor((entity.x - entity.radius) / this.cellSize);
    const maxCellX = Math.floor((entity.x + entity.radius) / this.cellSize);
    const minCellY = Math.floor((entity.y - entity.radius) / this.cellSize);
    const maxCellY = Math.floor((entity.y + entity.radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = this.getCellKey(cx, cy);
        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(entity);
      }
    }
  }

  /**
   * Bulk insertion of entities.
   */
  public insertMany(entities: readonly T[]): void {
    for (let i = 0; i < entities.length; i++) {
      this.insert(entities[i]);
    }
  }

  /**
   * Queries entities within a circular area. Returns unique candidates that
   * pass both broad-phase grid lookup and narrow-phase distance check.
   */
  public query(x: number, y: number, radius: number): T[] {
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);

    const candidates = new Set<T>();
    const results: T[] = [];

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = this.getCellKey(cx, cy);
        const cell = this.grid.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            candidates.add(cell[i]);
          }
        }
      }
    }

    // Narrow phase: exact circle-circle intersection
    for (const entity of candidates) {
      const dx = entity.x - x;
      const dy = entity.y - y;
      const combinedRadius = entity.radius + radius;
      if (dx * dx + dy * dy <= combinedRadius * combinedRadius) {
        results.push(entity);
      }
    }

    return results;
  }

  /**
   * Helper to check exact 2D circle collision between two entities.
   */
  public static checkCollision(a: SpatialEntity, b: SpatialEntity): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const combinedRadius = a.radius + b.radius;
    return dx * dx + dy * dy <= combinedRadius * combinedRadius;
  }

  /**
   * Helper to compute squared distance between two points (avoids Math.sqrt).
   */
  public static distanceSq(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }
}
