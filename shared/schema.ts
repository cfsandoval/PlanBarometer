import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  model: text("model").notNull(), // 'topp', 'nacional', 'subnacional'
  responses: json("responses").notNull(), // JSON object with element responses
  justifications: json("justifications").notNull().default({}), // JSON object with element justifications
  scores: json("scores"), // Calculated scores by criteria/dimensions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  title: true,
  model: true,
  responses: true,
  justifications: true,
  scores: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
