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

export const bestPractices = pgTable("best_practices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  country: text("country").notNull(),
  institution: text("institution"),
  year: integer("year"),
  sourceUrl: text("source_url"),
  sourceType: text("source_type").notNull(), // "pdf", "web", "academic", "case_study"
  targetCriteria: json("target_criteria").$type<string[]>().notNull(), // Array of criteria names
  results: text("results"),
  keyLessons: json("key_lessons").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const practiceRecommendations = pgTable("practice_recommendations", {
  id: serial("id").primaryKey(),
  practiceId: integer("practice_id").references(() => bestPractices.id),
  criterionName: text("criterion_name").notNull(),
  recommendation: text("recommendation").notNull(),
  implementationSteps: json("implementation_steps").$type<string[]>(),
  expectedImpact: text("expected_impact"),
  timeframe: text("timeframe"),
  createdAt: timestamp("created_at").defaultNow()
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

export const insertBestPracticeSchema = createInsertSchema(bestPractices).pick({
  title: true,
  description: true,
  country: true,
  institution: true,
  year: true,
  sourceUrl: true,
  sourceType: true,
  targetCriteria: true,
  results: true,
  keyLessons: true,
  tags: true,
});

export const insertPracticeRecommendationSchema = createInsertSchema(practiceRecommendations).pick({
  practiceId: true,
  criterionName: true,
  recommendation: true,
  implementationSteps: true,
  expectedImpact: true,
  timeframe: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertBestPractice = z.infer<typeof insertBestPracticeSchema>;
export type BestPractice = typeof bestPractices.$inferSelect;
export type InsertPracticeRecommendation = z.infer<typeof insertPracticeRecommendationSchema>;
export type PracticeRecommendation = typeof practiceRecommendations.$inferSelect;
