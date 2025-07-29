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
  exerciseCode: text("exercise_code"), // Código del ejercicio para organizar evaluaciones
  groupCode: text("group_code"), // Código del grupo que realiza la evaluación
  country: text("country"), // País donde se realiza la evaluación
  territory: text("territory"), // Territorio específico de la evaluación
  responses: json("responses").notNull(), // JSON object with element responses
  justifications: json("justifications").notNull().default({}), // JSON object with element justifications
  scores: json("scores"), // Calculated scores by criteria/dimensions
  customStructure: json("custom_structure"), // Custom criteria/elements if modified
  customAlerts: json("custom_alerts").default([]), // Custom strategic alerts created by user
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
  exerciseCode: true,
  groupCode: true,
  country: true,
  territory: true,
  responses: true,
  justifications: true,
  scores: true,
  customStructure: true,
  customAlerts: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
