import { trails, type Trail, type InsertTrail } from "@shared/schema";

export interface IStorage {
  getTrail(id: number): Promise<Trail | undefined>;
  getTrails(): Promise<Trail[]>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  updateTrail(id: number, trail: Partial<InsertTrail>): Promise<Trail | undefined>;
  deleteTrail(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private trails: Map<number, Trail>;
  private currentId: number;

  constructor() {
    this.trails = new Map();
    this.currentId = 1;
  }

  async getTrail(id: number): Promise<Trail | undefined> {
    return this.trails.get(id);
  }

  async getTrails(): Promise<Trail[]> {
    return Array.from(this.trails.values());
  }

  async createTrail(insertTrail: InsertTrail): Promise<Trail> {
    const id = this.currentId++;
    const trail: Trail = {
      ...insertTrail,
      id,
      description: insertTrail.description || null,
      isActive: insertTrail.isActive ?? true,
      createdAt: new Date(),
    };
    this.trails.set(id, trail);
    return trail;
  }

  async updateTrail(id: number, updateData: Partial<InsertTrail>): Promise<Trail | undefined> {
    const existingTrail = this.trails.get(id);
    if (!existingTrail) {
      return undefined;
    }

    const updatedTrail: Trail = {
      ...existingTrail,
      ...updateData,
    };
    this.trails.set(id, updatedTrail);
    return updatedTrail;
  }

  async deleteTrail(id: number): Promise<boolean> {
    return this.trails.delete(id);
  }
}

export const storage = new MemStorage();
