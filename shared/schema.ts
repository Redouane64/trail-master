import { z } from "zod";

// Trail point schema for map interactions
export const trailPointSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lon: z.number(),
});

// Location schema for GraphQL submission
export const locationSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  point: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  title: z.string().nullable().optional(),
});

// Track schema for GraphQL submission
export const trackSchema = z.object({
  points: z.array(trailPointSchema).min(2, "At least 2 points required"),
});

// Trail form schema for the creation form
export const trailFormSchema = z.object({
  name: z.string().min(1, "Trail name is required"),
  description: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  distance: z.number().min(0, "Distance must be positive"),
  approximateTime: z.number().min(0, "Time must be positive"),
  isActive: z.boolean().default(true),
});

export type TrailPoint = z.infer<typeof trailPointSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Track = z.infer<typeof trackSchema>;
export type TrailFormData = z.infer<typeof trailFormSchema>;
