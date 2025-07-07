import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  country: text("country").notNull(),
  city: text("city").notNull(),
  latitude: integer("latitude").notNull(), // stored as integers for precision
  longitude: integer("longitude").notNull(),
  distance: integer("distance").notNull(), // in meters
  approximateTime: integer("approximate_time").notNull(), // in milliseconds
  isActive: boolean("is_active").notNull().default(true),
  points: jsonb("points").notNull(), // array of trail points
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for trail points
export const trailPointSchema = z.object({
  id: z.string(),
  time: z.string(), // ISO timestamp
  lat: z.number(),
  lon: z.number(),
  altitude: z.number(),
});

export const locationSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  point: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  title: z.string().nullable().optional(),
});

export const trackSchema = z.object({
  points: z.array(trailPointSchema).min(2, "At least 2 points required"),
});

export const insertTrailSchema = createInsertSchema(trails).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Trail name is required"),
  description: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number().min(1, "Distance must be greater than 0"),
  approximateTime: z.number().min(1, "Time must be greater than 0"),
  points: z.array(trailPointSchema).min(2, "At least 2 points required"),
});

export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type Trail = typeof trails.$inferSelect;
export type TrailPoint = z.infer<typeof trailPointSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Track = z.infer<typeof trackSchema>;
